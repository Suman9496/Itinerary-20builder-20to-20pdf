import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdfFromElement(el: HTMLElement, fileName: string) {
  const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-pdf-page]"));
  const pages = nodes.length ? nodes : [el];

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight), undefined, "FAST");
  }

  pdf.save(fileName);
}
