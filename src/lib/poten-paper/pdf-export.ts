import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = 794;
const MARGIN_MM = 20;

interface SavedStyle {
  el: HTMLElement;
  cssText: string;
}

export async function exportToPdf(
  documentElement: HTMLDivElement,
  filename: string,
  businessName?: string,
): Promise<void> {
  const pages = documentElement.querySelectorAll<HTMLElement>('.a4-page');
  if (pages.length === 0) return;

  const savedStyles: SavedStyle[] = [];

  function save(el: HTMLElement | null, styles: Record<string, string>) {
    if (!el) return;
    savedStyles.push({ el, cssText: el.style.cssText });
    for (const [k, v] of Object.entries(styles)) {
      el.style.setProperty(k, v);
    }
  }

  // Fix scroll container so html2canvas can see all content
  const scroll = document.getElementById('document-scroll-area');
  save(scroll, {
    overflow: 'visible',
    height: 'auto',
    'max-height': 'none',
    flex: 'none',
    padding: '0',
  });

  // Fix flex parent
  const flexParent = scroll?.parentElement ?? null;
  save(flexParent, { overflow: 'visible', height: 'auto' });

  // Fix document container
  save(documentElement, {
    width: `${A4_WIDTH_PX}px`,
    'max-width': 'none',
    overflow: 'visible',
    margin: '0',
    padding: '0',
  });

  // Fix each page — force desktop padding, remove shadow/border/radius
  // html2canvas windowWidth (794px) triggers mobile media query which reduces padding to 24px
  // We must force the correct 76px padding inline to match the web view
  for (const page of pages) {
    save(page, {
      width: `${A4_WIDTH_PX}px`,
      'min-height': '1123px',
      padding: '76px',
      'max-width': 'none',
      'border-radius': '0',
      'box-shadow': 'none',
      'margin-bottom': '0',
      border: 'none',
    });
  }

  // Fix SVG text elements — html2canvas cannot resolve inherited font styles on SVG <text>
  // Inject computed styles inline so they survive the canvas render
  const svgTexts = documentElement.querySelectorAll('svg text, svg tspan');
  const svgTextSaved: { el: SVGElement; cssText: string }[] = [];
  for (const el of svgTexts) {
    const svgEl = el as SVGElement;
    svgTextSaved.push({ el: svgEl, cssText: svgEl.style.cssText });
    const computed = window.getComputedStyle(el);
    svgEl.style.fontFamily = computed.fontFamily || 'sans-serif';
    svgEl.style.fontSize = computed.fontSize || '11px';
    svgEl.style.fontWeight = computed.fontWeight || '400';
    svgEl.style.fill = computed.fill || '#374151';
  }

  // Wait for layout to settle
  await new Promise((r) => setTimeout(r, 300));

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let isFirstPage = true;
    const totalContentPages = pages.length - 1; // Exclude cover page
    let contentPageNum = 0;

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const page = pages[pageIdx];
      const isCover = pageIdx === 0;

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      });

      const imgWidthMm = A4_WIDTH_MM;
      const imgHeightMm = (canvas.height / canvas.width) * A4_WIDTH_MM;

      // Use 2mm tolerance to avoid floating-point issues
      // (1123px at 794px width ≈ 297.01mm, just over 297mm A4 height)
      if (imgHeightMm <= A4_HEIGHT_MM + 2) {
        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidthMm, imgHeightMm);

        // Add page number footer (skip cover page)
        if (!isCover) {
          contentPageNum++;
          addPageFooter(pdf, businessName, contentPageNum, totalContentPages);
        }
      } else {
        // Rare: single block exceeds page height — slice into multiple PDF pages
        const pageHeightPx = (canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM;
        const totalPdfPages = Math.ceil(canvas.height / pageHeightPx);

        for (let i = 0; i < totalPdfPages; i++) {
          if (!isFirstPage) pdf.addPage();
          isFirstPage = false;

          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.round(pageHeightPx);

          const ctx = slice.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, slice.width, slice.height);

          const srcY = Math.round(i * pageHeightPx);
          const srcH = Math.min(Math.round(pageHeightPx), canvas.height - srcY);
          ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

          pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

          if (!isCover) {
            contentPageNum++;
            addPageFooter(pdf, businessName, contentPageNum, totalContentPages);
          }
        }
      }
    }

    pdf.save(filename);
  } finally {
    // Restore SVG text styles
    for (const { el, cssText } of svgTextSaved) {
      el.style.cssText = cssText;
    }
    // Restore all original styles in reverse order
    for (let i = savedStyles.length - 1; i >= 0; i--) {
      savedStyles[i].el.style.cssText = savedStyles[i].cssText;
    }
  }
}

function addPageFooter(
  pdf: jsPDF,
  businessName: string | undefined,
  pageNum: number,
  _totalPages: number,
) {
  const footerY = A4_HEIGHT_MM - 12;

  pdf.setFontSize(8);
  pdf.setTextColor(160, 160, 160);

  // Business name on the left
  if (businessName) {
    pdf.text(businessName, MARGIN_MM, footerY);
  }

  // Page number on the right
  pdf.text(String(pageNum), A4_WIDTH_MM - MARGIN_MM, footerY, { align: 'right' });
}
