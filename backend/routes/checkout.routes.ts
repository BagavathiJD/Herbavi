import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";
import { logSqlQuery } from "../services/sqlLogger";
import { notifyLowStockIfNeeded } from "../services/lowStockNotifier";
import { isLowStock, LOW_STOCK_THRESHOLD, validateAndDecrementStock } from "../services/productStock";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "herbavi-dev-secret-change-in-production";

function resolveUserId(req: Request): number | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string };
    const userId = Number(payload.sub);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}

function mapUserDetail(row: RowDataPacket) {
  return {
    userId: row.user_id != null ? String(row.user_id) : null,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone_number,
    address: row.address ?? "",
    country: row.country,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    deliveryMethod: row.delivery_method,
    discountCode: row.discount_code ?? "",
    discountAmount: Number(row.discount_amount),
    subtotal: Number(row.subtotal),
    shippingAmount: Number(row.shipping_amount),
    totalAmount: Number(row.total_amount),
    cartItems: row.cart_items ?? [],
    termsAccepted: Boolean(row.terms_accepted),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

async function resolveOrCreateCustomer(
  fullName: string,
  email: string,
  phone: string
): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await query<RowDataPacket[]>(
    "SELECT id FROM customers WHERE LOWER(email) = ? LIMIT 1",
    [normalizedEmail]
  );
  if (existing.length > 0) {
    return String(existing[0].id);
  }

  const customerId = `c-${Date.now()}`;
  await query(
    `INSERT INTO customers (id, name, email, phone, total_orders, total_spend, status, join_date)
     VALUES (?, ?, ?, ?, 0, 0, 'Active', NOW())`,
    [customerId, fullName.trim(), normalizedEmail, phone.trim()]
  );
  return customerId;
}

async function resolveMeasurementName(
  measurementId: string,
  measurementValue: string | null | undefined
): Promise<string> {
  const measureRows = await query<RowDataPacket[]>(
    "SELECT name FROM measurements WHERE id = ? LIMIT 1",
    [measurementId]
  );
  if (measureRows.length === 0) {
    return measurementValue?.trim() || "1 Piece (pcs)";
  }
  const value = measurementValue?.trim() || "1";
  return `${value} ${measureRows[0].name}`;
}

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

async function createOrderRows(
  customerId: string,
  customerName: string,
  cartItems: CartItemInput[]
): Promise<number> {
  const orderBatchId = Date.now();
  let created = 0;

  for (let index = 0; index < cartItems.length; index += 1) {
    const item = cartItems[index];
    const productRows = await query<RowDataPacket[]>(
      `SELECT id, name, image_url, price, measurement_id, measurement_value
       FROM products WHERE id = ? LIMIT 1`,
      [item.id]
    );

    if (productRows.length === 0) {
      throw new Error(`Product "${item.name}" is no longer available.`);
    }

    const product = productRows[0];
    const qty = Math.max(1, Number(item.qty) || 1);
    const stockResult = await validateAndDecrementStock(String(product.id), qty, item.name);
    const unitPrice = Number(item.price) || Number(product.price);
    const lineTotal = parseFloat((unitPrice * qty).toFixed(2));
    const measurementName = await resolveMeasurementName(
      String(product.measurement_id),
      product.measurement_value != null ? String(product.measurement_value) : undefined
    );
    const orderId = `o-${orderBatchId}-${index + 1}`;

    await query(
      `INSERT INTO orders (
        id, user_id, user_name, product_id, product_name, product_image_url,
        quantity, measurement_name, price, total_amount, order_status, order_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
      [
        orderId,
        customerId,
        customerName,
        product.id,
        product.name,
        item.image || product.image_url || "",
        qty,
        measurementName,
        unitPrice,
        lineTotal,
      ]
    );

    logSqlQuery(
      `INSERT INTO orders (id, user_id, user_name, product_id, product_name, quantity, total_amount, order_status)
       VALUES ('${orderId}', '${customerId}', '${String(customerName).replace(/'/g, "''")}', '${product.id}', '${String(product.name).replace(/'/g, "''")}', ${qty}, ${lineTotal}, 'Pending');`
    );

    if (isLowStock(stockResult.stock)) {
      logSqlQuery(
        `LOW STOCK: ${stockResult.name} now has ${stockResult.stock} unit(s) (threshold ${LOW_STOCK_THRESHOLD}).`
      );
    }

    await notifyLowStockIfNeeded({
      productId: stockResult.productId,
      productName: stockResult.name,
      previousStock: stockResult.previousStock,
      newStock: stockResult.stock,
    });

    created += 1;
  }

  return created;
}

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      country,
      city,
      state,
      zipCode,
      deliveryMethod,
      discountCode,
      discountAmount,
      subtotal,
      shippingAmount,
      totalAmount,
      cartItems,
      termsAccepted,
    } = req.body;

    if (!fullName || !String(fullName).trim()) {
      res.status(400).json({ error: "Full name is required." });
      return;
    }
    if (!email || !String(email).trim()) {
      res.status(400).json({ error: "Email address is required." });
      return;
    }
    if (!phone || !String(phone).trim()) {
      res.status(400).json({ error: "Phone number is required." });
      return;
    }

    const resolvedDelivery =
      String(deliveryMethod ?? "").trim().toLowerCase() === "pickup" ? "Pickup" : "Delivery";
    const trimmedAddress = address ? String(address).trim() : "";

    if (resolvedDelivery === "Delivery" && !trimmedAddress) {
      res.status(400).json({ error: "Address is required for delivery orders." });
      return;
    }
    if (trimmedAddress.length > 500) {
      res.status(400).json({ error: "Address must be 500 characters or fewer." });
      return;
    }

    if (!country || !String(country).trim()) {
      res.status(400).json({ error: "Country is required." });
      return;
    }
    if (!city || !String(city).trim()) {
      res.status(400).json({ error: "City is required." });
      return;
    }
    if (!state || !String(state).trim()) {
      res.status(400).json({ error: "State is required." });
      return;
    }
    if (!zipCode || !String(zipCode).trim()) {
      res.status(400).json({ error: "ZIP code is required." });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ error: "You must accept the Terms and Conditions." });
      return;
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty." });
      return;
    }

    const userId = resolveUserId(req);
    const trimmedName = String(fullName).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const customerId = await resolveOrCreateCustomer(trimmedName, trimmedEmail, trimmedPhone);
    const ordersCreated = await createOrderRows(
      customerId,
      trimmedName,
      cartItems as CartItemInput[]
    );

    await query(
      `INSERT INTO user_details (
        user_id, full_name, email, phone_number, address, country, city, state, zip_code,
        delivery_method, discount_code, discount_amount, subtotal, shipping_amount,
        total_amount, cart_items, terms_accepted, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        trimmedName,
        trimmedEmail,
        trimmedPhone,
        trimmedAddress || null,
        String(country).trim(),
        String(city).trim(),
        String(state).trim(),
        String(zipCode).trim(),
        resolvedDelivery,
        discountCode ? String(discountCode).trim() : null,
        Number(discountAmount) || 0,
        Number(subtotal) || 0,
        Number(shippingAmount) || 0,
        Number(totalAmount) || 0,
        JSON.stringify(cartItems),
        termsAccepted ? 1 : 0,
      ]
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM user_details ORDER BY id DESC LIMIT 1"
    );

    logSqlQuery(
      `INSERT INTO user_details (full_name, email, delivery_method, total_amount) VALUES ('${trimmedName.replace(/'/g, "''")}', '${trimmedEmail}', '${resolvedDelivery}', ${Number(totalAmount) || 0});`
    );

    res.status(201).json({
      message: "Checkout details saved successfully.",
      ordersCreated,
      checkout: mapUserDetail(rows[0]),
    });
  } catch (err) {
    if (err instanceof Error) {
      const message = err.message;
      if (
        message.includes("no longer available") ||
        message.includes("Cart is empty")
      ) {
        res.status(400).json({ error: message });
        return;
      }
    }
    next(err);
  }
});

export default router;
