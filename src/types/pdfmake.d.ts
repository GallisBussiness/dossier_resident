declare module 'pdfmake' {
  interface TDocumentDefinitions {
    content: any;
    styles?: any;
    defaultStyle?: any;
    pageSize?: string | { width: number; height: number };
    pageOrientation?: 'portrait' | 'landscape';
    pageMargins?: [number, number, number, number];
    header?: any;
    footer?: any;
    background?: any;
    images?: Record<string, any>;
    watermark?: any;
    info?: any;
    compress?: boolean;
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      printing?: 'highResolution' | 'lowResolution';
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
    };
  }

  interface TFontDictionary {
    [fontName: string]: {
      normal?: string;
      bold?: string;
      italics?: string;
      bolditalics?: string;
    };
  }

  interface TCreatedPdf {
    download: (defaultFileName?: string, cb?: () => void, options?: any) => void;
    open: (options?: any, win?: Window) => void;
    print: (options?: any, win?: Window) => void;
    getDataUrl: (cb?: (dataUrl: string) => void, options?: any) => void;
    getBase64: (cb?: (data: string) => void, options?: any) => void;
    getBuffer: (cb?: (buffer: ArrayBuffer) => void, options?: any) => void;
    getBlob: (cb?: (blob: Blob) => void, options?: any) => void;
  }

  interface PDFMake {
    vfs: Record<string, string>;
    fonts: TFontDictionary;
    createPdf: (documentDefinition: TDocumentDefinitions) => TCreatedPdf;
  }

  const pdfMake: PDFMake;
  export default pdfMake;
}
