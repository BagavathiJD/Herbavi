import "dotenv/config";
import { execSync } from "child_process";
import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import backendApp from "./backend/app";
import { runMigrations } from "./backend/db/migrate";
import { seedIfEmpty } from "./backend/db/seed";

const app = express();
const PORT = 3000;

function getLatestMtime(targetPath: string): number {
  if (!fs.existsSync(targetPath)) return 0;

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) return stat.mtimeMs;

  let latest = stat.mtimeMs;
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const entryPath = path.join(targetPath, entry.name);
    latest = Math.max(latest, getLatestMtime(entryPath));
  }
  return latest;
}

function ensureUserBuild(userRoot: string) {
  const distIndex = path.join(userRoot, "dist", "index.html");
  const srcDir = path.join(userRoot, "src");
  const publicDir = path.join(userRoot, "public");
  const distMtime = fs.existsSync(distIndex) ? fs.statSync(distIndex).mtimeMs : 0;
  const sourceMtime = Math.max(getLatestMtime(srcDir), getLatestMtime(publicDir));
  const needsBuild = !fs.existsSync(distIndex) || sourceMtime > distMtime;

  if (needsBuild) {
    console.log("Building user storefront...");
    execSync("npm run build", { cwd: userRoot, stdio: "inherit" });
    console.log("User storefront build complete.");
  }
}

function mountUserStorefront(userRoot: string) {
  const userDist = path.join(userRoot, "dist");
  const userIndexHtml = path.join(userDist, "index.html");

  app.use("/user", express.static(userDist, { index: false }));

  app.get(["/user", "/user/*"], (req, res, next) => {
    const requestedPath = req.path;
    const isStaticFile = path.extname(requestedPath) !== "";

    if (isStaticFile) {
      return next();
    }

    res.sendFile(userIndexHtml);
  });
}

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

  const isProduction = process.env.NODE_ENV === "production";
  const projectRoot = process.cwd();
  const userRoot = path.join(projectRoot, "user");

  if (!isProduction) {
    ensureUserBuild(userRoot);
  } else if (!fs.existsSync(path.join(userRoot, "dist", "index.html"))) {
    console.error("User storefront build missing. Run: npm run build --prefix user");
    process.exit(1);
  }

  mountUserStorefront(userRoot);

  if (!isProduction) {
    const adminVite = await createViteServer({
      configFile: path.join(projectRoot, "vite.config.ts"),
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            path.join(projectRoot, "data"),
            path.join(projectRoot, "data", "**"),
            path.join(projectRoot, "user", "dist"),
            path.join(projectRoot, "user", "dist", "**"),
          ],
        },
        hmr: {
          port: process.env.WS_PORT ? Number(process.env.WS_PORT) : undefined,
        },
      },
      appType: "spa",
    });

    app.use(adminVite.middlewares);
  } else {
    const distPath = path.join(projectRoot, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Login (default): http://localhost:" + PORT + "/");
    console.log("User storefront: http://localhost:" + PORT + "/user/ (after User login)");
  });

  server.on("error", (err: any) => {
    if (err && err.code === "EADDRINUSE") {
      console.error("Port " + PORT + " is already in use. Another process may be running.");
      console.error("If you have another instance running, stop it or set a different PORT env variable.");
      process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
  });
}

startServer();
