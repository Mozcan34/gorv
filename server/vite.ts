// server/vite.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM modülleri için __dirname alternatifini oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basit bir log fonksiyonu (dilerseniz farklı bir logger kullanabilirsiniz)
export function log(message: string) {
  console.log(`[Vite Server] ${message}`);
}

export async function setupVite(app: express.Application, server: any) {
  // Development modunda Vite dev sunucusunu entegre et
  // Vite'ın ana kütüphanesini dinamik olarak import ediyoruz
  const vite = await import('vite');
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base: '/gorv/', // vite.config.ts'deki ile aynı olmalı
    // root: path.resolve(__dirname, '..', 'client'), // Projenin client kök dizini
  });

  app.use(viteServer.middlewares);

  log('Vite development server is integrated.');
}

export function serveStatic(app: express.Application) {
  // Üretim build'indeki statik dosyaların yolu
  // server/vite.ts -> server/ -> PROJECT_ROOT/ -> dist/public
  const staticFilesPath = path.resolve(__dirname, '..', 'dist', 'public');
  
  log(`Serving static files from: ${staticFilesPath}`);
  
  // Statik dosyaları sunmak için Express middleware'i
  app.use(express.static(staticFilesPath));

  // SPA (Tek Sayfalı Uygulama) yönlendirmesi için catch-all rotası
  // Herhangi bir sunucu rotasıyla eşleşmeyen istekler için index.html'i döndür
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
  });
}