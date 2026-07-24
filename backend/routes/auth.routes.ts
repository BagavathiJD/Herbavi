import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";
import { logSqlQuery } from "../services/sqlLogger";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "herbavi-dev-secret-change-in-production";

function normalizeRole(role: unknown) {
  const value = String(role ?? "").trim().toLowerCase();
  if (value === "admin") return "Admin";
  return "User"; // default to 'User' for new registrations unless explicitly 'admin'
}

function formatDobValue(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).trim().slice(0, 10);
}

function validateDob(value: unknown): { ok: true; dob: string } | { ok: false; error: string } {
  const dobStr = formatDobValue(value);
  if (!dobStr) {
    return { ok: false, error: "Date of birth is required." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
    return { ok: false, error: "Date of birth must be a valid date (YYYY-MM-DD)." };
  }

  const [year, month, day] = dobStr.split("-").map(Number);
  const dobDate = new Date(year, month - 1, day);
  if (
    Number.isNaN(dobDate.getTime()) ||
    dobDate.getFullYear() !== year ||
    dobDate.getMonth() !== month - 1 ||
    dobDate.getDate() !== day
  ) {
    return { ok: false, error: "Date of birth is invalid." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dobDate.setHours(0, 0, 0, 0);

  if (dobDate > today) {
    return { ok: false, error: "Date of birth cannot be in the future." };
  }

  const minAgeCutoff = new Date(today);
  minAgeCutoff.setFullYear(minAgeCutoff.getFullYear() - 13);
  if (dobDate > minAgeCutoff) {
    return { ok: false, error: "You must be at least 13 years old to register." };
  }

  const maxAgeCutoff = new Date(today);
  maxAgeCutoff.setFullYear(maxAgeCutoff.getFullYear() - 120);
  if (dobDate < maxAgeCutoff) {
    return { ok: false, error: "Please enter a valid date of birth." };
  }

  return { ok: true, dob: dobStr };
}

function mapAuthUser(row: RowDataPacket) {
  const role = normalizeRole(row.role);
  const dob = formatDobValue(row.dob);
  return {
    id: String(row.id),
    name: row.user_name,
    email: row.email,
    phone: row.phone_number ?? "",
    dob: dob ?? "",
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
    const { name, email, password, phone, dob } = req.body;

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

    const phoneDigits = String(phone).replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      res.status(400).json({ error: "Phone number must be 10 to 15 digits." });
      return;
    }

    const dobResult = validateDob(dob);
    if (!dobResult.ok) {
      res.status(400).json({ error: dobResult.error });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();
    const trimmedPhone = phoneDigits.slice(0, 15);
    const resolvedRole = "User";

    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [trimmedEmail]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    await query(
      `INSERT INTO users (user_name, password, email, phone_number, dob, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [trimmedName, passwordHash, trimmedEmail, trimmedPhone, dobResult.dob, resolvedRole]
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
      dob: dobResult.dob,
      role: resolvedRole as "Admin" | "User",
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
    console.log("Login request received");

    const rows = await query<RowDataPacket[]>(
      "SELECT id, user_name, email, phone_number, password, role, dob, created_at FROM users WHERE LOWER(email) = ?",
      [trimmedEmail]
    );
    console.log("User rows:", rows);  
    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const row = rows[0];
    let valid = await bcrypt.compare(String(password), row.password);
    if (!valid && typeof row.password === "string" && !row.password.startsWith("$2")) {
      // Legacy support for plaintext password rows: allow authentication,
      // then immediately upgrade the stored password to a bcrypt hash.
      if (String(password) === row.password) {
        valid = true;
        const upgradedHash = await bcrypt.hash(String(password), 10);
        await query("UPDATE users SET password = ? WHERE id = ?", [upgradedHash, row.id]);
        logSqlQuery(`UPDATE users SET password = '[hash]' WHERE id = ${row.id};`);
      }
    }

    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }
    console.log("Password valid:", valid);

    logSqlQuery(`SELECT * FROM users WHERE email = '${trimmedEmail}';`);

    const user = mapAuthUser(row);
    const token = signToken(user);

    res.json({ token, user });
  }catch (err) {
  console.error("LOGIN ERROR:", err);

  return res.status(500).json({
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
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
      "SELECT id, user_name, email, phone_number, role, dob, created_at FROM users WHERE id = ?",
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

router.put("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const { name, email, phone } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Name is required." });
      return;
    }
    if (!email || !String(email).trim()) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = phone ? String(phone).replace(/\D/g, "").slice(0, 15) : "";

    const existingUser = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [payload.sub]
    );
    if (existingUser.length === 0) {
      res.status(401).json({ error: "User not found." });
      return;
    }

    const emailConflict = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE LOWER(email) = ? AND id <> ?",
      [trimmedEmail, payload.sub]
    );
    if (emailConflict.length > 0) {
      res.status(409).json({ error: "Another account already uses this email address." });
      return;
    }

    await query(
      `UPDATE users
       SET user_name = ?, email = ?, phone_number = ?, updated_at = NOW()
       WHERE id = ?`,
      [trimmedName, trimmedEmail, trimmedPhone, payload.sub]
    );

    logSqlQuery(
      `UPDATE users SET user_name = '${trimmedName.replace(/'/g, "''")}', email = '${trimmedEmail}', phone_number = '${trimmedPhone.replace(/'/g, "''")}', updated_at = NOW() WHERE id = ${payload.sub};`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, user_name, email, phone_number, role, dob, created_at FROM users WHERE id = ?",
      [payload.sub]
    );

    res.json(mapAuthUser(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !String(email).trim()) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    if (!newPassword || String(newPassword).length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Check if user exists
    const rows = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [trimmedEmail]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "No account found with this email address." });
      return;
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    // Update the password
    await query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
      [passwordHash, trimmedEmail]
    );

    logSqlQuery(
      `UPDATE users SET password = '[hash]', updated_at = NOW() WHERE email = '${trimmedEmail}';`
    );

    res.json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (err) {
    next(err);
  }
});

export default router;
