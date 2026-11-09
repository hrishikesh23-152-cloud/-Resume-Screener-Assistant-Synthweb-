import { PDFParse } from "pdf-parse";
import { AppError } from "../errors/AppError.js";
import { MAX_RESUME_LENGTH } from "../schemas/analysis.js";

const MAX_PDF_PAGES = 20;

export async function extractResumeText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "text/plain" && file.originalname.toLowerCase().endsWith(".txt")) {
    try {
      return validateExtractedText(new TextDecoder("utf-8", { fatal: true }).decode(file.buffer));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Text resume must contain valid UTF-8.", 400);
    }
  }

  if (
    file.mimetype !== "application/pdf" ||
    !file.originalname.toLowerCase().endsWith(".pdf") ||
    !file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))
  ) {
    throw new AppError("Upload a valid .txt or PDF resume file.", 415);
  }

  const parser = new PDFParse({ data: file.buffer });
  try {
    const info = await parser.getInfo();
    if (info.total > MAX_PDF_PAGES) {
      throw new AppError(`PDF resumes must contain ${MAX_PDF_PAGES} pages or fewer.`, 413);
    }
    const result = await parser.getText({ first: MAX_PDF_PAGES });
    return validateExtractedText(result.text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Could not read this PDF. Upload a valid, unencrypted PDF with selectable text.",
      400,
    );
  } finally {
    await parser.destroy();
  }
}

function validateExtractedText(text: string): string {
  const normalized = text.trim();
  if (normalized.length < 20) {
    throw new AppError("The uploaded resume contains too little readable text.", 400);
  }
  if (normalized.length > MAX_RESUME_LENGTH) {
    throw new AppError(`Extracted resume text must be ${MAX_RESUME_LENGTH.toLocaleString()} characters or fewer.`, 413);
  }
  return normalized;
}
