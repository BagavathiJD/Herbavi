import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const db = process.env.DB_DATABASE || "herbavi_ecommerce";
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: db,
  });

  const [products] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT id, name, price FROM products LIMIT 1"
  );
  await connection.end();

  if (products.length === 0) {
    console.error("No products found.");
    process.exit(1);
  }

  const product = products[0];
  const payload = {
    fullName: "Test User",
    email: "test-checkout@example.com",
    phone: "9876543210",
    country: "India",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "600001",
    deliveryMethod: "Delivery",
    discountCode: "",
    discountAmount: 0,
    subtotal: Number(product.price),
    shippingAmount: 49,
    totalAmount: Number(product.price) + 49,
    cartItems: [{ id: product.id, name: product.name, qty: 1, price: Number(product.price) }],
    termsAccepted: true,
  };

  const res = await fetch("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);

  if (!res.ok) process.exit(1);

  const connection2 = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: db,
  });
  const [orders] = await connection2.query<mysql.RowDataPacket[]>(
    "SELECT id, user_name, product_name, quantity, total_amount, order_status FROM orders ORDER BY order_date DESC LIMIT 3"
  );
  console.log("Recent orders:", orders);
  await connection2.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
