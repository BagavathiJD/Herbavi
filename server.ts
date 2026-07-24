import "dotenv/config";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import backendApp from "./backend/app";
import { runMigrations } from "./backend/db/migrate";
import { seedIfEmpty } from "./backend/db/seed";
import { isLowStockMailConfigured, mailConfig } from "./backend/config/mail";
import { isLowStockWhatsAppConfigured, whatsappConfig } from "./backend/config/whatsapp";

const app = express();
const PORT = 3000;
const ADMIN_BASE = "/admin";

function pathOnly(url: string): string {
  return url.split("?")[0] ?? "";
}

function isApiPath(url: string): boolean {
  const pathname = pathOnly(url);
  return pathname.startsWith("/api") || pathname.startsWith("/postal-api");
}

function isAdminPath(url: string): boolean {
  const pathname = pathOnly(url);
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}

function isLegacyUserPath(url: string): boolean {
  const pathname = pathOnly(url);
  return pathname === "/user" || pathname.startsWith("/user/");
}

function legacyUserRedirect(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isLegacyUserPath(req.originalUrl)) {
    return next();
  }

  const pathname = pathOnly(req.originalUrl);
  const targetPath = pathname.replace(/^\/user(?=\/|$)/, "") || "/";
  const query = req.originalUrl.includes("?") ? `?${req.originalUrl.split("?")[1]}` : "";
  res.redirect(301, `${targetPath}${query}`);
}

function mountUserStorefront(userRoot: string) {
  const userDist = path.join(userRoot, "dist");
  const userIndexHtml = path.join(userDist, "index.html");

  app.use(express.static(userDist, { index: false }));

  app.get("*", (req, res, next) => {
    const pathname = pathOnly(req.originalUrl);
    if (isAdminPath(pathname) || isApiPath(pathname) || path.extname(pathname) !== "") {
      return next();
    }
    res.sendFile(userIndexHtml);
  });
}

function mountAdminPanel(projectRoot: string) {
  const adminDist = path.join(projectRoot, "dist");
  const adminIndexHtml = path.join(adminDist, "index.html");

  app.use(ADMIN_BASE, express.static(adminDist, { index: false }));

  app.get([ADMIN_BASE, `${ADMIN_BASE}/*`], (req, res, next) => {
    if (path.extname(pathOnly(req.originalUrl)) !== "") {
      return next();
    }
    res.sendFile(adminIndexHtml);
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

    if (path.extname(pathOnly(url))) {
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
    if (isLowStockMailConfigured()) {
      console.log(`Low stock email alerts enabled → ${mailConfig.notifyTo}`);
    } else if (mailConfig.enabled) {
      console.warn("LOW_STOCK_EMAIL_ENABLED is true but SMTP settings are incomplete. Alerts will not be sent.");
    }

    if (isLowStockWhatsAppConfigured()) {
      console.log(`Low stock WhatsApp alerts enabled → ${whatsappConfig.notifyTo}`);
    } else if (whatsappConfig.enabled) {
      console.warn("LOW_STOCK_WHATSAPP_ENABLED is true but CallMeBot settings are incomplete.");
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
    console.error(
      "Ensure MySQL is running and DB_* variables are set in .env (see .env.example)."
    );
    process.exit(1);
  }

  app.use(backendApp);
  app.use(legacyUserRedirect);

  const isProduction = process.env.NODE_ENV === "production";
  const projectRoot = process.cwd();
  const userRoot = path.join(projectRoot, "user");
  const httpServer = createServer(app);

  if (isProduction) {
    if (!fs.existsSync(path.join(userRoot, "dist", "index.html"))) {
      console.error("User storefront build missing. Run: npm run build --prefix user");
      process.exit(1);
    }

    mountAdminPanel(projectRoot);
    mountUserStorefront(userRoot);
  } else {
    const userVite = await mountUserDevServer(userRoot, httpServer);
    const adminVite = await mountAdminDevServer(projectRoot, userRoot, httpServer);

    app.use((req, res, next) => {
      const url = pathOnly(req.originalUrl);
      if (isAdminPath(url)) {
        return adminVite.middlewares(req, res, next);
      }
      next();
    });
    attachSpaFallback(
      adminVite,
      path.join(projectRoot, "admin", "index.html"),
      (url) => isAdminPath(url)
    );

    app.use((req, res, next) => {
      const url = pathOnly(req.originalUrl);
      if (isApiPath(url) || isAdminPath(url)) {
        return next();
      }
      return userVite.middlewares(req, res, next);
    });
    attachSpaFallback(
      userVite,
      path.join(userRoot, "index.html"),
      (url) => !isApiPath(url) && !isAdminPath(url)
    );
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("Website (user panel): http://localhost:" + PORT + "/");
    console.log("Admin login: http://localhost:" + PORT + ADMIN_BASE + "/");
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
