import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import backendApp from "./backend/app";
import { runMigrations } from "./backend/db/migrate";
import { seedIfEmpty } from "./backend/db/seed";

const app = express();
const PORT = 3000;

async function startServer() {
  try {
    await runMigrations();
    await seedIfEmpty();
    console.log("MySQL database ready.");
  } catch (err) {
    console.error("Database initialization failed:", err);
    console.error(
      "Ensure MySQL is running and DB_* variables are set in .env (see .env.example)."
    );
    process.exit(1);
  }

  app.use(backendApp);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            path.join(process.cwd(), "data"),
            path.join(process.cwd(), "data", "**"),
            path.join(process.cwd(), "src", "db.json"),
          ],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
