declare module "pdfjs-dist/build/pdf" {
  const pdfjsLib: any;
  export = pdfjsLib;
}

declare module "pdfjs-dist/build/pdf.worker.entry" {
  const pdfWorker: string;
  export = pdfWorker;
}
