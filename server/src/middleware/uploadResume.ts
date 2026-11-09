import multer from "multer";
import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 300 * 1024,
    files: 1,
    fields: 4,
    parts: 5,
  },
  fileFilter(_request, file, callback) {
    if (!file.originalname.toLowerCase().endsWith(".pdf")) {
      callback(new AppError("Upload a PDF resume.", 415));
      return;
    }
    callback(null, true);
  },
});

export function uploadResumeFile(request: Request, response: Response, next: (error?: unknown) => void): void {
  resumeUpload.single("resumeFile")(request, response, (error?: unknown) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Resume file must be 300 KB or smaller.", 413));
      return;
    }
    if (error instanceof multer.MulterError) {
      next(new AppError("Upload one PDF using the resumeFile field.", 400));
      return;
    }
    next(error);
  });
}
