// server/index.ts

import express, { type Request, Response, NextFunction } from "express";
import http from "http"; // http modülünü import ediyoruz
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Bu kısım, `registerRoutes`'un ne döndürdüğüne bağlıdır.
  // Eğer `registerRoutes` sadece rotaları `app`'e ekliyor ve bir http.Server döndürmüyorsa,
  // aşağıdaki satırı `const server = http.createServer(app);` olarak değiştirmeniz gerekebilir.
  // Mevcut kodunuzda `server.listen` çağrıldığı için, http.Server beklediği varsayılmıştır.
  const server = await registerRoutes(app); 

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Uygulama Hatası:", err);

    res.status(status).json({ message });
    // throw err; // Bu satırı kaldırmak genellikle daha güvenlidir.
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // PORT numarasını ortam değişkeninden al, yoksa 3000'i varsayılan olarak kullan.
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000; 
  
  server.listen({
    port: port,
    host: "127.0.0.1", // Yerel geliştirme için 127.0.0.1 daha güvenilir olabilir
    reusePort: false, // Genellikle tek bir Node.js işlemi için gerekli değildir
  }, () => {
    log(`Server is running on port ${port}`);
    console.log(`Uygulama şu adreste çalışıyor: http://localhost:${port}`);
  });
})();