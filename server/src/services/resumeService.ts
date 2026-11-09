import { PDFParse } from "pdf-parse";
import { AppError } from "../errors/AppError.js";
import { MAX_RESUME_LENGTH } from "../models/analysisModel.js";

const MAX_PDF_PAGES = 20;

export async function extractPdfText(file: Express.Multer.File): Promise<string> {
  if (!file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new AppError("The uploaded file is not a valid PDF.", 415);
  }

  const parser = new PDFParse({ data: file.buffer });
  try {
    const info = await parser.getInfo();
    if (info.total > MAX_PDF_PAGES) {
      throw new AppError(`PDF must contain ${MAX_PDF_PAGES} pages or fewer.`, 413);
    }

    const { text } = await parser.getText({ first: MAX_PDF_PAGES });
    const resumeText = text.trim();
    if (resumeText.length < 20) {
      throw new AppError("Could not find readable text in this PDF.", 400);
    }
    if (resumeText.length > MAX_RESUME_LENGTH) {
      throw new AppError(`Extracted resume must be ${MAX_RESUME_LENGTH.toLocaleString()} characters or fewer.`, 413);
    }

    return resumeText;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Could not read the PDF. Try another PDF with selectable text.", 400);
  } finally {
    await parser.destroy();
  }
}
