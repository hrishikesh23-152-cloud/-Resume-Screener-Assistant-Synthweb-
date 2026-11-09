import multer from "multer";
import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 60 * 1024,
    files: 1,
    fields: 4,
    parts: 5,
  },
  fileFilter(_request, file, callback) {
    const name = file.originalname.toLowerCase();
    const isText = name.endsWith(".txt") && file.mimetype === "text/plain";
    const isPdf = name.endsWith(".pdf") && file.mimetype === "application/pdf";
    if (!isText && !isPdf) {
      callback(new AppError("Upload a plain-text .txt or PDF resume file.", 415));
      return;
    }
    callback(null, true);
  },
});

export function uploadResumeFile(request: Request, response: Response, next: (error?: unknown) => void): void {
  resumeUpload.single("resumeFile")(request, response, (error?: unknown) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Resume file must be 60 KB or smaller.", 413));
      return;
    }
    if (error instanceof multer.MulterError) {
      next(new AppError("Upload exactly one resume file using the resumeFile field.", 400));
      return;
    }
    next(error);
  });
}
