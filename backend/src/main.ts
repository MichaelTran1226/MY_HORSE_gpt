import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.APP_ORIGIN?.startsWith("https://")
  )
    throw new Error("Production APP_ORIGIN must use HTTPS");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  const limits = new Map<string, { count: number; expires: number }>();
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    if (req.path.startsWith("/api/"))
      res.setHeader("Cache-Control", "no-store");
    if (req.method === "POST" && req.path.startsWith("/api/auth/")) {
      const now = Date.now();
      for (const [key, value] of limits)
        if (value.expires < now) limits.delete(key);
      const key = req.ip;
      const limit = limits.get(key) || { count: 0, expires: now + 60000 };
      limit.count++;
      limits.set(key, limit);
      if (limit.count > 20) {
        res.setHeader("Retry-After", "60");
        return res
          .status(429)
          .json({ message: "Too many attempts. Please wait one minute." });
      }
    }
    next();
  });

  // Global Prefix
  app.setGlobalPrefix("api");

  // CORS Configuration
  app.enableCors({
    origin: process.env.APP_ORIGIN || "http://localhost:5173",
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup at /api/docs
  const config = new DocumentBuilder()
    .setTitle("EquiFlow API")
    .setDescription(
      "Horse Training & Racing Club Management System — Modular REST API Specification",
    )
    .setVersion("2.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== "production")
    SwaggerModule.setup("api/docs", app, document);

  const clientPath = join(__dirname, "../../frontend/dist");
  if (existsSync(clientPath)) {
    app.useStaticAssets(clientPath);
    const express = app.getHttpAdapter().getInstance();
    express.get(/^(?!\/api(?:\/|$)).*/, (_req, res) =>
      res.sendFile(join(clientPath, "index.html")),
    );
  }
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");
  console.log(
    `[EquiFlow Backend] Server running at http://localhost:${port}/api`,
  );
  console.log(
    `[EquiFlow Backend] Swagger Documentation at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
