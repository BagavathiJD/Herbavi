import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";
import { mapProduct, normalizeProductCategory, parseGalleryImages, parseProductCategoryFilter } from "../db/rowMappers";
import { logSqlQuery } from "../services/sqlLogger";
import { notifyLowStockIfNeeded } from "../services/lowStockNotifier.js";
import { deleteProductCascade } from "../services/productDeletion.js";

const router = Router();

const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.description, p.image_url, p.gallery_images,
         p.measurement_id, p.measurement_value, p.price, p.original_price, p.stock, p.status, p.category, p.created_at,
         m.name AS measurement_name
  FROM products p
  LEFT JOIN measurements m ON p.measurement_id = m.id
`;

function resolveStockValue(stock: unknown, fallback = 100): number | { error: string } {
  if (stock === undefined || stock === null || stock === "") {
    return fallback;
  }

  const resolved = Math.floor(Number(stock));
  if (isNaN(resolved) || resolved < 0) {
    return { error: "Stock must be a valid number of 0 or greater." };
  }

  return resolved;
}

function resolveProductPrices(
  price: unknown,
  originalPrice: unknown
): { price: number; originalPrice: number } | { error: string } {
  const resolvedPrice = Number(price);
  const resolvedOriginalPrice = Number(originalPrice);

  if (price === undefined || price === null || price === "") {
    return { error: "Discount price is required." };
  }
  if (originalPrice === undefined || originalPrice === null || originalPrice === "") {
    return { error: "Actual price is required." };
  }
  if (isNaN(resolvedPrice) || resolvedPrice <= 0) {
    return { error: "Discount price must be a valid number greater than 0." };
  }
  if (isNaN(resolvedOriginalPrice) || resolvedOriginalPrice <= 0) {
    return { error: "Actual price must be a valid number greater than 0." };
  }
  if (resolvedOriginalPrice <= resolvedPrice) {
    return { error: "Actual price must be higher than discount price." };
  }

  return { price: resolvedPrice, originalPrice: resolvedOriginalPrice };
}

function resolveGalleryPayload(
  imageUrl: unknown,
  galleryImages: unknown
): { primary: string; gallery: string[] } | { error: string } {
  let images = parseGalleryImages(galleryImages);
  const trimmedPrimary = imageUrl != null ? String(imageUrl).trim() : "";

  if (images.length === 0 && trimmedPrimary) {
    images = [trimmedPrimary];
  }

  if (images.length === 0) {
    return { error: "At least one product image is required." };
  }

  if (images.length > 4) {
    return { error: "A product can have at most 4 images." };
  }

  return { primary: images[0], gallery: images };
}

function serializeGalleryValue(gallery: unknown): string | null {
  if (gallery == null) {
    return null;
  }
  if (typeof gallery === "string") {
    const trimmed = gallery.trim();
    if (!trimmed) return null;
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify(parseGalleryImages(trimmed));
    }
  }
  const parsed = parseGalleryImages(gallery);
  return parsed.length > 0 ? JSON.stringify(parsed) : null;
}

async function bulkUpdateStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updates = Array.isArray(req.body?.updates) ? req.body.updates : null;
    if (!updates || updates.length === 0) {
      res.status(400).json({ error: "Provide at least one stock update." });
      return;
    }

    const updatedProducts = [];

    for (const entry of updates) {
      const productId = entry?.id != null ? String(entry.id).trim() : "";
      const stockResult = resolveStockValue(entry?.stock);
      if (!productId) {
        res.status(400).json({ error: "Each stock update must include a product id." });
        return;
      }
      if (typeof stockResult === "object" && "error" in stockResult) {
        res.status(400).json({ error: stockResult.error });
        return;
      }

      const existing = await query<RowDataPacket[]>(
        "SELECT id, name, stock FROM products WHERE id = ? LIMIT 1",
        [productId]
      );
      if (existing.length === 0) {
        res.status(404).json({ error: `Product "${productId}" not found.` });
        return;
      }

      const previousStock = Math.max(0, Math.floor(Number(existing[0].stock ?? 0)));
      await query("UPDATE products SET stock = ? WHERE id = ?", [stockResult, productId]);
      await notifyLowStockIfNeeded({
        productId,
        productName: String(existing[0].name),
        previousStock,
        newStock: stockResult,
      });
      const rows = await query<RowDataPacket[]>(`${PRODUCT_SELECT} WHERE p.id = ?`, [productId]);
      if (rows.length > 0) {
        updatedProducts.push(mapProduct(rows[0]));
      }
    }

    logSqlQuery(`UPDATE products SET stock = ... (${updatedProducts.length} row(s));`);
    res.json({ products: updatedProducts });
  } catch (err) {
    next(err);
  }
}

async function updateProductStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const stockResult = resolveStockValue(req.body?.stock);
    if (typeof stockResult === "object" && "error" in stockResult) {
      res.status(400).json({ error: stockResult.error });
      return;
    }

    const existing = await query<RowDataPacket[]>(
      "SELECT id, name, stock FROM products WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const previousStock = Math.max(0, Math.floor(Number(existing[0].stock ?? 0)));
    await query("UPDATE products SET stock = ? WHERE id = ?", [stockResult, id]);
    await notifyLowStockIfNeeded({
      productId: String(id),
      productName: String(existing[0].name),
      previousStock,
      newStock: stockResult,
    });
    const rows = await query<RowDataPacket[]>(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
    res.json(mapProduct(rows[0]));
  } catch (err) {
    next(err);
  }
}

router.put("/stock/bulk", bulkUpdateStock);
router.patch("/stock/bulk", bulkUpdateStock);
router.post("/stock/bulk", bulkUpdateStock);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, category } = req.query;
    let sql = PRODUCT_SELECT;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      const term = `%${String(search)}%`;
      params.push(term, term);
    }
    if (status) {
      conditions.push("p.status = ?");
      params.push(String(status));
    }
    const categoryFilter = parseProductCategoryFilter(category);
    if (categoryFilter) {
      conditions.push("p.category = ?");
      params.push(categoryFilter);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY p.created_at DESC";

    logSqlQuery(
      "SELECT p.*, m.name AS measurement_name FROM products p LEFT JOIN measurements m ON p.measurement_id = m.id ORDER BY p.created_at DESC;"
    );

    const rows = await query<RowDataPacket[]>(sql, params);
    res.json(rows.map(mapProduct));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/stock", updateProductStock);
router.put("/:id/stock", updateProductStock);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const rows = await query<RowDataPacket[]>(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = mapProduct(rows[0]);
    const variantRows = await query<RowDataPacket[]>(
      `${PRODUCT_SELECT}
       WHERE p.status = 'Active'
         AND LOWER(TRIM(p.name)) = LOWER(TRIM(?))
       ORDER BY CAST(p.measurement_value AS DECIMAL(10,2)) ASC, p.price ASC`,
      [product.name]
    );

    res.json({
      product,
      variants: variantRows.map(mapProduct),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl, galleryImages, measurementId, measurementValue, price, originalPrice, stock, status, category } =
      req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Product name is required." });
      return;
    }

    if (!measurementId) {
      res.status(400).json({ error: "Measurement is required." });
      return;
    }

    if (
      measurementValue === undefined ||
      measurementValue === null ||
      !String(measurementValue).trim()
    ) {
      res.status(400).json({ error: "Measurement volume is required (e.g. 1, 2)." });
      return;
    }

    if (price === undefined || price === null || price === "") {
      res.status(400).json({ error: "Discount price is required." });
      return;
    }

    const priceResult = resolveProductPrices(price, originalPrice);
    if ("error" in priceResult) {
      res.status(400).json({ error: priceResult.error });
      return;
    }

    const galleryResult = resolveGalleryPayload(imageUrl, galleryImages);
    if ("error" in galleryResult) {
      res.status(400).json({ error: galleryResult.error });
      return;
    }

    const resolvedName = String(name).trim();
    const resolvedDescription = String(description || "").trim();
    const resolvedImageUrl = galleryResult.primary;
    const resolvedGalleryJson = JSON.stringify(galleryResult.gallery);
    const resolvedMeasurementId = String(measurementId);
    const resolvedMeasurementValue = String(measurementValue).trim();
    const resolvedPrice = priceResult.price;
    const resolvedOriginalPrice = priceResult.originalPrice;
    const stockResult = resolveStockValue(stock);
    if (typeof stockResult === "object" && "error" in stockResult) {
      res.status(400).json({ error: stockResult.error });
      return;
    }
    const resolvedStock = stockResult;
    const resolvedStatus = status === "Inactive" ? "Inactive" : "Active";
    const resolvedCategory = normalizeProductCategory(category);

    if (!category || !String(category).trim()) {
      res.status(400).json({ error: "Category is required." });
      return;
    }

    const parsedMeasurementValue = Number(resolvedMeasurementValue);
    if (isNaN(parsedMeasurementValue) || parsedMeasurementValue <= 0) {
      res.status(400).json({
        error: "Measurement volume must be a valid number greater than 0 (e.g. 1, 2).",
      });
      return;
    }

    const productNameRow = await query<RowDataPacket[]>(
      "SELECT id, status FROM product_names WHERE name = ?",
      [resolvedName]
    );
    if (productNameRow.length === 0) {
      const productNameId = "pn-" + Date.now();
      await query(
        "INSERT INTO product_names (id, name, status, created_at) VALUES (?, ?, 'Enabled', NOW())",
        [productNameId, resolvedName]
      );
    } else if (productNameRow[0].status === "Disabled") {
      res.status(400).json({
        error: "Selected product name is disabled in Product Name master.",
      });
      return;
    }

    const measurement = await query<RowDataPacket[]>(
      "SELECT id, status FROM measurements WHERE id = ?",
      [resolvedMeasurementId]
    );
    if (measurement.length === 0) {
      res.status(400).json({ error: "Measurement not found." });
      return;
    }
    if (measurement[0].status === "Disabled") {
      res.status(400).json({
        error: "Selected measurement is disabled. Choose an enabled unit.",
      });
      return;
    }

    const id = "p-" + Date.now();

    await query(
      `INSERT INTO products (id, name, description, image_url, gallery_images, measurement_id, measurement_value, price, original_price, stock, status, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        resolvedName,
        resolvedDescription,
        resolvedImageUrl,
        resolvedGalleryJson,
        resolvedMeasurementId,
        resolvedMeasurementValue,
        resolvedPrice,
        resolvedOriginalPrice,
        resolvedStock,
        resolvedStatus,
        resolvedCategory,
      ]
    );

    const imageLog =
      resolvedImageUrl.length > 80
        ? resolvedImageUrl.slice(0, 40) + "...[uploaded image]"
        : resolvedImageUrl;

    logSqlQuery(
      `INSERT INTO products (id, name, description, image_url, measurement_id, measurement_value, price, status, category, created_at) \nVALUES ('${id}', '${resolvedName.replace(/'/g, "''")}', '${resolvedDescription.replace(/'/g, "''")}', '${imageLog}', '${resolvedMeasurementId}', '${resolvedMeasurementValue.replace(/'/g, "''")}', ${resolvedPrice}, '${resolvedStatus}', '${resolvedCategory}', NOW());`
    );

    const rows = await query<RowDataPacket[]>(
      `${PRODUCT_SELECT} WHERE p.id = ?`,
      [id]
    );

    res.status(201).json(mapProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, galleryImages, measurementId, measurementValue, price, originalPrice, stock, status, category } =
      req.body;

    const existing = await query<RowDataPacket[]>(
      `${PRODUCT_SELECT} WHERE p.id = ?`,
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const row = existing[0];
    const updatedName = name !== undefined ? String(name).trim() : row.name;
    const updatedDescription =
      description !== undefined ? String(description).trim() : row.description;
    const updatedImageUrl =
      imageUrl !== undefined || galleryImages !== undefined
        ? resolveGalleryPayload(
            imageUrl !== undefined ? imageUrl : row.image_url,
            galleryImages !== undefined ? galleryImages : row.gallery_images
          )
        : null;

    if (updatedImageUrl && "error" in updatedImageUrl) {
      res.status(400).json({ error: updatedImageUrl.error });
      return;
    }

    const finalImageUrl =
      updatedImageUrl && !("error" in updatedImageUrl)
        ? updatedImageUrl.primary
        : row.image_url;
    const finalGalleryJson =
      updatedImageUrl && !("error" in updatedImageUrl)
        ? JSON.stringify(updatedImageUrl.gallery)
        : serializeGalleryValue(row.gallery_images);
    const updatedMeasurementId =
      measurementId !== undefined ? String(measurementId) : row.measurement_id;
    const updatedMeasurementValue =
      measurementValue !== undefined
        ? String(measurementValue).trim()
        : row.measurement_value;
    const nextPrice = price !== undefined ? Number(price) : Number(row.price);
    const nextOriginalPrice =
      originalPrice !== undefined
        ? Number(originalPrice)
        : row.original_price != null
          ? Number(row.original_price)
          : null;
    const priceResult = resolveProductPrices(nextPrice, nextOriginalPrice);
    if ("error" in priceResult) {
      res.status(400).json({ error: priceResult.error });
      return;
    }
    const updatedPrice = priceResult.price;
    const updatedOriginalPrice = priceResult.originalPrice;
    const stockResult = resolveStockValue(
      stock !== undefined ? stock : row.stock,
      row.stock != null ? Math.max(0, Math.floor(Number(row.stock))) : 100
    );
    if (typeof stockResult === "object" && "error" in stockResult) {
      res.status(400).json({ error: stockResult.error });
      return;
    }
    const updatedStock = stockResult;
    const updatedStatus = status !== undefined ? status : row.status;
    const updatedCategory =
      req.body && "category" in req.body
        ? normalizeProductCategory(category)
        : normalizeProductCategory(row.category);

    if (measurementValue !== undefined) {
      const parsedMeasurementValue = Number(updatedMeasurementValue);
      if (isNaN(parsedMeasurementValue) || parsedMeasurementValue <= 0) {
        res.status(400).json({
          error: "Measurement volume must be a valid number greater than 0 (e.g. 1, 2).",
        });
        return;
      }
    }

    if (measurementId !== undefined) {
      const measurement = await query<RowDataPacket[]>(
        "SELECT id FROM measurements WHERE id = ?",
        [updatedMeasurementId]
      );
      if (measurement.length === 0) {
        res.status(400).json({ error: "Measurement not found" });
        return;
      }
    }

    await query(
      `UPDATE products SET name = ?, description = ?, image_url = ?, gallery_images = ?, measurement_id = ?, measurement_value = ?, price = ?, original_price = ?, stock = ?, status = ?, category = ? WHERE id = ?`,
      [
        updatedName,
        updatedDescription,
        finalImageUrl,
        finalGalleryJson,
        updatedMeasurementId,
        updatedMeasurementValue,
        updatedPrice,
        updatedOriginalPrice,
        updatedStock,
        updatedStatus,
        updatedCategory,
        id,
      ]
    );

    const previousStock = Math.max(0, Math.floor(Number(row.stock ?? 0)));
    await notifyLowStockIfNeeded({
      productId: String(id),
      productName: updatedName,
      previousStock,
      newStock: updatedStock,
    });

    if (name !== undefined && updatedName !== row.name) {
      await query("UPDATE orders SET product_name = ? WHERE product_id = ?", [
        updatedName,
        id,
      ]);
    }

    logSqlQuery(
      `UPDATE products SET name = '${String(updatedName).replace(/'/g, "''")}', price = ${updatedPrice}, status = '${updatedStatus}' WHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      `${PRODUCT_SELECT} WHERE p.id = ?`,
      [id]
    );
    res.json(mapProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existing = await query<RowDataPacket[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const { deletedOrders } = await deleteProductCascade(id);
      res.json({
        message:
          deletedOrders > 0
            ? `Product deleted successfully (${deletedOrders} related order(s) removed).`
            : "Product deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
