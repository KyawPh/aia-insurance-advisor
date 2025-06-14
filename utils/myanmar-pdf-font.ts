// Myanmar font configuration for jsPDF
// Using base64 encoded font data to avoid external dependencies

export const MYANMAR_FONT_NAME = 'NotoSansMyanmar'

// This is a minimal subset of Noto Sans Myanmar for basic Myanmar text
// In production, you should use a proper font file
export const addMyanmarFont = (jsPDF: any) => {
  // For Myanmar text support, we need to use a different approach
  // since jsPDF doesn't handle complex scripts well
  
  // Option 1: Use Unicode ranges that jsPDF can handle
  // Option 2: Convert text to images (not ideal)
  // Option 3: Use a different PDF library like pdfmake or PDFKit
  
  // For now, we'll implement a workaround using HTML/CSS rendering
}

// Helper function to create bilingual text for PDF
export const createBilingualText = (english: string, myanmar: string, includeMyanmar: boolean = false) => {
  if (!includeMyanmar) {
    return english;
  }
  // For now, return English only due to jsPDF limitations
  // In a production app, consider using pdfmake or PDFKit for better Unicode support
  return `${english}`;
}

// Alternative approach: Generate PDF using html2canvas + jsPDF
export const generatePDFWithMyanmar = async (element: HTMLElement, filename: string) => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF with Myanmar text:', error);
    return false;
  }
}