import "dotenv/config";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import backendApp from "./backend/app";
import { runMigrations } from "./backend/db/migrate";
import { seedIfEmpty } from "./backend/db/seed";

const app = express();
const PORT = 3000;

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

function mountUserDevServer(userRoot: string, httpServer: ReturnType<typeof createServer>) {
  return createViteServer({
    root: userRoot,
    configFile: path.join(userRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
      watch:
        process.env.DISABLE_HMR === "true"
          ? null
          : {
              usePolling: true,
              interval: 100,
              ignored: [path.join(userRoot, "dist"), path.join(userRoot, "dist", "**")],
            },
    },
    appType: "spa",
  });
}

function mountAdminDevServer(projectRoot: string, userRoot: string, httpServer: ReturnType<typeof createServer>) {
  return createViteServer({
    configFile: path.join(projectRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
      watch:
        process.env.DISABLE_HMR === "true"
          ? null
          : {
              usePolling: true,
              interval: 100,
              ignored: [
                path.join(projectRoot, "data"),
                path.join(projectRoot, "data", "**"),
                path.join(userRoot, "dist"),
                path.join(userRoot, "dist", "**"),
              ],
            },
    },
    appType: "spa",
  });
}

function attachSpaFallback(
  vite: ViteDevServer,
  indexHtmlPath: string,
  shouldHandle: (url: string) => boolean
) {
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    if (!shouldHandle(url)) {
      return next();
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    if (path.extname(url.split("?")[0] ?? "")) {
      return next();
    }

    try {
      let template = fs.readFileSync(indexHtmlPath, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
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
  const httpServer = createServer(app);

  if (isProduction) {
    if (!fs.existsSync(path.join(userRoot, "dist", "index.html"))) {
      console.error("User storefront build missing. Run: npm run build --prefix user");
      process.exit(1);
    }

    mountUserStorefront(userRoot);

    const distPath = path.join(projectRoot, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const userVite = await mountUserDevServer(userRoot, httpServer);
    const adminVite = await mountAdminDevServer(projectRoot, userRoot, httpServer);

    app.use((req, res, next) => {
      const url = req.originalUrl.split("?")[0] ?? "";
      if (url === "/user" || url.startsWith("/user/")) {
        return userVite.middlewares(req, res, next);
      }
      next();
    });
    attachSpaFallback(
      userVite,
      path.join(userRoot, "index.html"),
      (url) => url === "/user" || url.startsWith("/user/")
    );

    app.use((req, res, next) => {
      const url = req.originalUrl.split("?")[0] ?? "";
      if (url.startsWith("/user") || url.startsWith("/api")) {
        return next();
      }
      return adminVite.middlewares(req, res, next);
    });
    attachSpaFallback(
      adminVite,
      path.join(projectRoot, "index.html"),
      (url) => !url.startsWith("/user") && !url.startsWith("/api")
    );
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("Login (default): http://localhost:" + PORT + "/");
    console.log("User storefront: http://localhost:" + PORT + "/user/ (after User login)");
    if (!isProduction) {
      console.log("Dev mode: saving files under user/src or user/public will hot-reload automatically.");
    }
  });

  httpServer.on("error", (err: any) => {
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
