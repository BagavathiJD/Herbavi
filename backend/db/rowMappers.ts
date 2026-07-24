import { RowDataPacket } from "mysql2";

export type ProductCategory = "Siddha" | "Ayurveda" | "Unani";

export function normalizeProductCategory(value: unknown): ProductCategory {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (normalized === "siddha" || normalized === "sidha") {
    return "Siddha";
  }

  if (normalized === "unani") {
    return "Unani";
  }

  return "Ayurveda";
}

export function parseProductCategoryFilter(value: unknown): ProductCategory | null {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (!normalized || normalized === "all") {
    return null;
  }

  if (normalized === "siddha" || normalized === "sidha") {
    return "Siddha";
  }

  if (normalized === "unani") {
    return "Unani";
  }

  if (
    normalized === "ayurveda" ||
    normalized === "ayurvedha" ||
    normalized === "ayurvetha" ||
    normalized === "ayurved"
  ) {
    return "Ayurveda";
  }

  return null;
}

export function mapMeasurement(row: RowDataPacket) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  };
}

export function mapProductName(row: RowDataPacket) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  };
}

export function parseGalleryImages(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  let raw: unknown[] = [];
  if (Array.isArray(value)) {
    raw = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        raw = parsed;
      }
    } catch {
      return [];
    }
  } else if (Buffer.isBuffer(value)) {
    try {
      const parsed = JSON.parse(value.toString("utf8"));
      if (Array.isArray(parsed)) {
        raw = parsed;
      }
    } catch {
      return [];
    }
  } else if (typeof value === "object") {
    raw = Array.isArray(value) ? value : [];
  }

  return raw
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function mapProduct(row: RowDataPacket) {
  const imageUrl = row.image_url ?? "";
  const galleryFromDb = parseGalleryImages(row.gallery_images);
  const galleryImages =
    galleryFromDb.length > 0 ? galleryFromDb : imageUrl ? [String(imageUrl)] : [];

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    imageUrl: galleryImages[0] ?? imageUrl,
    galleryImages,
    measurementId: row.measurement_id,
    measurementValue: row.measurement_value ?? "1",
    measurementName: row.measurement_name ?? "",
    price: Number(row.price),
    originalPrice:
      row.original_price != null && row.original_price !== ""
        ? Number(row.original_price)
        : null,
    stock:
      row.stock != null && row.stock !== ""
        ? Math.max(0, Math.floor(Number(row.stock)))
        : 100,
    status: row.status,
    category: normalizeProductCategory(row.category),
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  };
}

export function mapOrder(row: RowDataPacket) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    productId: row.product_id,
    productName: row.product_name,
    productImageUrl: row.product_image_url ?? "",
    quantity: row.quantity,
    measurementName: row.measurement_name,
    price: Number(row.price),
    totalAmount: Number(row.total_amount),
    orderStatus: row.order_status,
    orderDate: row.order_date instanceof Date
      ? row.order_date.toISOString()
      : String(row.order_date),
  };
}

function normalizeRole(role: unknown) {
  const value = String(role ?? "").trim().toLowerCase();
  if (value === "admin") return "Admin";
  return "User";
}

export function mapAppUser(row: RowDataPacket) {
  return {
    id: String(row.id),
    userName: row.user_name,
    email: row.email,
    phoneNumber: row.phone_number ?? "",
    role: normalizeRole(row.role),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export function mapCustomer(row: RowDataPacket) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    totalOrders: row.total_orders,
    totalSpend: Number(row.total_spend),
    status: row.status,
    joinDate: row.join_date instanceof Date
      ? row.join_date.toISOString()
      : String(row.join_date),
  };
}
