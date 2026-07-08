import { RowDataPacket } from "mysql2";

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

export function mapProduct(row: RowDataPacket) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    measurementId: row.measurement_id,
    measurementValue: row.measurement_value ?? "1",
    price: Number(row.price),
    status: row.status,
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
