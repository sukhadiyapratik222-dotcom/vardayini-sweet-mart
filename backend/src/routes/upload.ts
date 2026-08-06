import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imagesDir = path.join(__dirname, "../../public/images");
const VALID_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

// GET /api/upload - List all stored images in public/uploads and public/images for Media Gallery
router.get("/", (_req, res) => {
  try {
    const list: Array<{ url: string; filename: string; source: string; size: number; createdAt: string }> = [];

    // 1. Scan public/uploads
    if (fs.existsSync(uploadsDir)) {
      const uploadFiles = fs.readdirSync(uploadsDir);
      for (const file of uploadFiles) {
        const ext = path.extname(file).toLowerCase();
        if (VALID_IMAGE_EXTENSIONS.has(ext)) {
          const filePath = path.join(uploadsDir, file);
          const stat = fs.statSync(filePath);
          list.push({
            url: `/uploads/${file}`,
            filename: file,
            source: "uploads",
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }

    // 2. Scan public/images
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir);
      for (const file of imageFiles) {
        const ext = path.extname(file).toLowerCase();
        if (VALID_IMAGE_EXTENSIONS.has(ext)) {
          const filePath = path.join(imagesDir, file);
          const stat = fs.statSync(filePath);
          list.push({
            url: `/images/${file}`,
            filename: file,
            source: "catalog",
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list media files" });
  }
});

// POST /api/upload - Saves base64 image or photo payload to public/uploads
router.post("/", (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image payload provided" });
    }

    let base64Data = image;
    let extension = "jpg";

    if (image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        extension = matches[1] === "jpeg" ? "jpg" : matches[1];
        base64Data = matches[2];
      }
    }

    const nameWithoutExt = filename 
      ? filename.replace(/[^a-zA-Z0-9.-]/g, "_")
      : `photo_${Date.now()}.${extension}`;

    const finalFilename = `${Date.now()}_${nameWithoutExt}`;
    const filePath = path.join(uploadsDir, finalFilename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const fileUrl = `/uploads/${finalFilename}`;
    res.json({ success: true, url: fileUrl, filename: finalFilename });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload photo" });
  }
});

// DELETE /api/upload/:filename - Delete photo from public/uploads
router.delete("/:filename", (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: `Image ${filename} deleted successfully` });
    }

    return res.status(404).json({ error: "Image file not found in uploads folder" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete image" });
  }
});

export default router;
