import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";
import { logSqlQuery } from "../services/sqlLogger";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "herbavi-dev-secret-change-in-production";

function mapAuthUser(row: RowDataPacket) {
  const role = row.role === "Staff" ? "Staff" : "Admin";
  return {
    id: String(row.id),
    name: row.user_name,
    email: row.email,
    phone: row.phone_number ?? "",
    role,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "User name is required." });
      return;
    }
    if (!email || !String(email).trim()) {
      res.status(400).json({ error: "Mail is required." });
      return;
    }
    if (!password || String(password).length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }
    if (!phone || !String(phone).trim()) {
      res.status(400).json({ error: "Phone number is required." });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim().slice(0, 15);
    const resolvedRole = role === "Staff" ? "Staff" : "Admin";

    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [trimmedEmail]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    await query(
      `INSERT INTO users (user_name, password, email, phone_number, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [trimmedName, passwordHash, trimmedEmail, trimmedPhone, resolvedRole]
    );

    const inserted = await query<RowDataPacket[]>(
      "SELECT id, role, created_at FROM users WHERE email = ?",
      [trimmedEmail]
    );
    const insertId = inserted[0]?.id;

    logSqlQuery(
      `INSERT INTO users (user_name, password, email, phone_number, role, created_at, updated_at) VALUES ('${trimmedName.replace(/'/g, "''")}', '[hash]', '${trimmedEmail}', '${trimmedPhone.replace(/'/g, "''")}', '${resolvedRole}', NOW(), NOW());`
    );

    const user = {
      id: String(insertId),
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      role: resolvedRole as "Admin" | "Staff",
      createdAt:
        inserted[0]?.created_at instanceof Date
          ? inserted[0].created_at.toISOString()
          : new Date().toISOString(),
    };
    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    const rows = await query<RowDataPacket[]>(
      "SELECT id, user_name, email, phone_number, password, role, created_at FROM users WHERE email = ?",
      [trimmedEmail]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const row = rows[0];
    const valid = await bcrypt.compare(String(password), row.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    logSqlQuery(`SELECT * FROM users WHERE email = '${trimmedEmail}';`);

    const user = mapAuthUser(row);
    const token = signToken(user);

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const rows = await query<RowDataPacket[]>(
      "SELECT id, user_name, email, phone_number, role, created_at FROM users WHERE id = ?",
      [payload.sub]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: "User not found." });
      return;
    }

    res.json(mapAuthUser(rows[0]));
  } catch {
    res.status(401).json({ error: "Invalid or expired session." });
  }
});

export default router;
