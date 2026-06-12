import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error & { code?: string; errno?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err.code === "ER_DUP_ENTRY") {
    res.status(409).json({ error: "A record with this name already exists" });
    return;
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    res.status(400).json({ error: "Referenced record does not exist" });
    return;
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    res.status(400).json({
      error: "Cannot delete. Record is referenced by other data.",
    });
    return;
  }
  if (err.code === "ER_DATA_TOO_LONG") {
    res.status(400).json({
      error: "Image data is too large. Try a smaller image or restart the server to apply database migrations.",
    });
    return;
  }
  console.error("API error:", err.message || err);
  res.status(500).json({ error: "Internal server error" });
}
