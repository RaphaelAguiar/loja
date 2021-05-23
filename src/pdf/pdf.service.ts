import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream, unlink } from 'fs';
const PDFGenerator = require('pdfkit');
const uuid = require('uuid/v4');

export interface PdfReference {
  path: string;
  descartar: () => void;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger('PdfService');

  generate(text: string): Promise<PdfReference> {
    return new Promise<PdfReference>((resolve, reject) => {
      const documentName = `${uuid()}.pdf`;
      const output = new PDFGenerator();
      const stream = createWriteStream(documentName);
      output.pipe(stream);
      output.text(text);
      stream.on('finish', function() {
        resolve({
          path: documentName,
          descartar: () => {
            unlink(documentName, err => {
              if (err) {
                this.logger.error(err);
              }
            });
          },
        });
      });
      output.end();
    });
  }
}
