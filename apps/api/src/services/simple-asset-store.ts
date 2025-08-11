import { FastifyInstance } from "fastify";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

// Simple file storage for development (no MinIO needed)
export class SimpleAssetStore {
  private uploadDir = "./uploads";

  constructor() {
    // Ensure upload directory exists
    mkdir(this.uploadDir, { recursive: true });
  }

  async upload(file: Buffer, originalName: string): Promise<string> {
    const filename = `${nanoid()}-${originalName}`;
    const filepath = join(this.uploadDir, filename);

    await writeFile(filepath, file);

    // Return URL that will be served by static file handler
    return `/uploads/${filename}`;
  }

  // Register static file serving
  static registerRoutes(fastify: FastifyInstance) {
    fastify.register(require("@fastify/static"), {
      root: join(process.cwd(), "uploads"),
      prefix: "/uploads/",
    });
  }
}
