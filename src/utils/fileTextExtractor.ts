import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

export interface FileExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: 'txt' | 'docx' | 'pdf';
  isScannedPdf?: boolean;
}

// Polyfill Promise.try for environments where it is not yet natively supported
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function (fn: any, ...args: any[]) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Configure PDF.js worker in browser environments
if (typeof window !== 'undefined') {
  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
  } catch (e) {
    console.warn('PDF.js worker initialization notice:', e);
  }
}

/**
 * Validates and extracts readable text from PDF, DOCX, or TXT files in-browser.
 */
export async function extractTextFromJobDescriptionFile(file: File): Promise<FileExtractionResult> {
  if (!file) {
    return { success: false, error: 'No file was provided.' };
  }

  // 1. File Size Validation
  if (file.size === 0) {
    return {
      success: false,
      error: `"${file.name}" is an empty file (0 bytes). Please upload a file containing a job description.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `File size (${sizeInMb} MB) exceeds the 10 MB limit. Please select a smaller file or paste the text directly.`,
    };
  }

  const fileNameLower = file.name.toLowerCase();

  // 2. Determine file format
  let format: 'txt' | 'docx' | 'pdf' | null = null;
  if (fileNameLower.endsWith('.txt') || file.type === 'text/plain') {
    format = 'txt';
  } else if (
    fileNameLower.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    format = 'docx';
  } else if (fileNameLower.endsWith('.pdf') || file.type === 'application/pdf') {
    format = 'pdf';
  }

  if (!format) {
    return {
      success: false,
      error: `Unsupported file format for "${file.name}". Please upload a PDF (.pdf), Microsoft Word (.docx), or plain text (.txt) file.`,
    };
  }

  // 3. Extract text based on format
  try {
    if (format === 'txt') {
      const text = await extractTextFromTxt(file);
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: `"${file.name}" contains no readable text. Please check the file content.`,
        };
      }
      return {
        success: true,
        text: text.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: 'txt',
      };
    }

    if (format === 'docx') {
      const text = await extractTextFromDocx(file);
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: `No readable text could be extracted from "${file.name}". The document may be blank, contain only images, or be password-protected.`,
        };
      }
      return {
        success: true,
        text: text.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: 'docx',
      };
    }

    if (format === 'pdf') {
      const result = await extractTextFromPdf(file);
      return result;
    }
  } catch (err: any) {
    console.error('File text extraction failure:', err);
    return {
      success: false,
      error: `Failed to read "${file.name}": ${err?.message || 'The file may be corrupted or encrypted.'}. Please try pasting the text manually.`,
    };
  }

  return { success: false, error: 'Unknown file processing error.' };
}

/**
 * Reads plain text files using standard file.text()
 */
async function extractTextFromTxt(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return await file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read plain text file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Extracts text from Microsoft Word (.docx) files using mammoth
 */
async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  let result;
  if (typeof Buffer !== 'undefined' && Buffer.from) {
    result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
  } else {
    result = await mammoth.extractRawText({ arrayBuffer });
  }
  return result.value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * Extracts text from PDF files using pdfjs-dist
 */
async function extractTextFromPdf(file: File): Promise<FileExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      return {
        success: false,
        error: `"${file.name}" has 0 pages or is an empty PDF.`,
      };
    }

    const pageTexts: string[] = [];
    let totalChars = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter((s: string) => Boolean(s && s.trim()))
        .join(' ');

      if (pageStr.trim()) {
        pageTexts.push(pageStr.trim());
        totalChars += pageStr.trim().length;
      }
    }

    const combinedText = pageTexts.join('\n\n').trim();

    // Check if the PDF has virtually no selectable text (scanned image PDF)
    if (totalChars < 25) {
      return {
        success: false,
        isScannedPdf: true,
        error: `"${file.name}" appears to be a scanned image or contains non-selectable text. Automatic text extraction cannot read image-only PDFs. Please copy and paste the job description text manually.`,
      };
    }

    return {
      success: true,
      text: combinedText,
      fileName: file.name,
      fileSize: file.size,
      fileType: 'pdf',
    };
  } catch (pdfErr: any) {
    if (pdfErr?.name === 'PasswordException') {
      return {
        success: false,
        error: `"${file.name}" is password-protected. Please remove the password or paste the job description text manually.`,
      };
    }
    if (pdfErr?.name === 'InvalidPDFException') {
      return {
        success: false,
        error: `"${file.name}" is not a valid or readable PDF file.`,
      };
    }
    throw pdfErr;
  }
}
