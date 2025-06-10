'use client';

import { useCallback, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileText, Settings, ImageIcon, Layout } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

interface PDFExporterProps {
  contentId: string;
  filename: string;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialImageFormat?: 'jpeg' | 'png';
  mode?: 'pdf' | 'image'; // 'pdf' by default
}

interface LinkInfo {
  x: number; // Original pixel X relative to content element top-left
  y: number; // Original pixel Y relative to content element top-left
  width: number; // Original pixel width
  height: number; // Original pixel height
  url: string;
}

interface PageDimensions {
  width: number; // in mm
  height: number; // in mm
}

// --- Constants ---
const PAGE_FORMATS: Record<string, PageDimensions> = {
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
  legal: { width: 216, height: 356 },
  tabloid: { width: 279, height: 432 },
};

const DEFAULT_PDF_OPTIONS = {
  format: 'a4',
  orientation: 'portrait',
  filename: '', // Will be overwritten by prop
  marginTop: 7, // in mm
  marginBottom: 7, // in mm
  marginLeft: 7, // in mm
  marginRight: 7, // in mm
  scale: 2, // html2canvas scale
  quality: 0.95, // JPEG quality
  imageFormat: 'jpeg', // Default to jpeg for PDF
  backgroundColor: '#ffffff',
  dpi: 300, // jsPDF only
  compress: true, // jsPDF only
  enableLinks: true,
  useCORS: true,
  allowTaint: false,
  width: 0, // 0 = auto for html2canvas
  height: 0, // 0 = auto for html2canvas
};

// --- Debugging Flags (Set to true to activate) ---
const DEBUG_LINKS_RECTS = false; // Set to true to draw red rectangles instead of invisible links
const DEBUG_LOGGING = false; // Set to true for detailed console logs

export function PDFExporter({
  contentId,
  filename,
  isGenerating,
  setIsGenerating,
  open,
  onOpenChange,
  initialImageFormat = 'jpeg',
  mode = 'pdf',
}: PDFExporterProps) {
  const { t } = useTranslation();
  const [pdfOptions, setPdfOptions] = useState(() => ({
    ...DEFAULT_PDF_OPTIONS,
    filename: filename,
    imageFormat: initialImageFormat,
  }));

  // Sync internal state with external props
  useEffect(() => {
    setPdfOptions((prev) => ({
      ...prev,
      filename: filename,
      imageFormat: initialImageFormat,
    }));
  }, [filename, initialImageFormat]);

  const getPageDimensions = useCallback((): PageDimensions => {
    const format = PAGE_FORMATS[pdfOptions.format] || PAGE_FORMATS.a4;
    return pdfOptions.orientation === 'landscape'
      ? { width: format.height, height: format.width }
      : format;
  }, [pdfOptions.format, pdfOptions.orientation]);

  // Helper to extract links from an element, given its bounding rect
  const extractLinks = useCallback(
    (element: HTMLElement, elementRect: DOMRect): LinkInfo[] => {
      const links: LinkInfo[] = [];
      if (!pdfOptions.enableLinks) return links;

      const linkElements = element.querySelectorAll('a[href]');

      linkElements.forEach((linkElement) => {
        const anchor = linkElement as HTMLAnchorElement;
        const rect = anchor.getBoundingClientRect(); // Bounding box of the anchor in viewport coords

        // Ensure link is visible and has dimensions before considering it
        if (anchor.href && rect.width > 0 && rect.height > 0) {
          // Calculate link's position relative to the content element's top-left corner
          const relativeX = rect.left - elementRect.left;
          const relativeY = rect.top - elementRect.top;

          links.push({
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
            url: anchor.href,
          });
        }
      });
      if (DEBUG_LOGGING) {
        console.log(`[extractLinks] Found ${links.length} links:`, links);
      }
      return links;
    },
    [pdfOptions.enableLinks],
  );

  // Adds clickable link annotations to the jsPDF instance
  const addLinksToPDF = useCallback(
    (
      pdf: jsPDF,
      links: LinkInfo[],
      contentWidth: number, // Width of content area on PDF page (in mm)
      contentHeight: number, // Height of content area on PDF page (in mm)
      imgWidth: number, // Total width of the scaled image in PDF mm
      imgHeight: number, // Total height of the scaled image in PDF mm
      capturedCanvasWidthPx: number, // Actual pixel width of the canvas generated by html2canvas
      capturedCanvasHeightPx: number, // Actual pixel height of the canvas generated by html2canvas
    ) => {
      if (links.length === 0) {
        if (DEBUG_LOGGING) console.log('[addLinksToPDF] No links to add.');
        return;
      }

      // These scales convert from the *original DOM pixel dimensions* (from getBoundingClientRect,
      // relative to the element passed to html2canvas) to the final PDF millimeters.
      const pixelToPdfScaleX = imgWidth / capturedCanvasWidthPx;
      const pixelToPdfScaleY = imgHeight / capturedCanvasHeightPx;

      links.forEach((link, index) => {
        // 1. Calculate the link's absolute position and dimensions in PDF millimeters,
        //    relative to the top-left of the *entire content image*.
        const absoluteScaledLinkX = link.x * pixelToPdfScaleX;
        const absoluteScaledLinkY = link.y * pixelToPdfScaleY;
        const scaledLinkWidth = link.width * pixelToPdfScaleX;
        const scaledLinkHeight = link.height * pixelToPdfScaleY;

        // 2. Determine which PDF page this link belongs to.
        //    `absoluteScaledLinkY` is the Y from the top of the entire content image.
        //    `contentHeight` is the height of the printable area on *one* PDF page.
        const pageIndex = Math.floor(absoluteScaledLinkY / contentHeight);
        const targetPageNumber = pageIndex + 1; // jsPDF pages are 1-indexed

        // 3. Calculate the link's Y position *relative to the top of its specific PDF page's content area*.
        //    We need to subtract the height of all full preceding pages from `absoluteScaledLinkY`.
        const yOnCurrentPageContentArea =
          absoluteScaledLinkY - pageIndex * contentHeight;

        // 4. Add the PDF margins to get the final coordinates on the PDF page.
        const finalPdfX = pdfOptions.marginLeft + absoluteScaledLinkX;
        const finalPdfY = pdfOptions.marginTop + yOnCurrentPageContentArea;

        // --- Boundary Check ---
        // Ensure the link's entire rectangle fits within the current page's content area.
        // This is important to prevent annotations appearing on wrong pages or being clipped.
        const isWithinPageBounds =
          finalPdfX >= pdfOptions.marginLeft &&
          finalPdfX + scaledLinkWidth <= pdfOptions.marginLeft + contentWidth &&
          finalPdfY >= pdfOptions.marginTop &&
          finalPdfY + scaledLinkHeight <= pdfOptions.marginTop + contentHeight;

        if (isWithinPageBounds) {
          try {
            // IMPORTANT: Set the page context before adding the link
            // This ensures the link is added to the correct page, crucial for multi-page docs.
            pdf.setPage(targetPageNumber);

            if (DEBUG_LINKS_RECTS) {
              // DEBUG: Draw a colored rectangle to visualize the clickable area
              pdf.setFillColor(255, 0, 0, 0.3); // Semi-transparent red fill
              pdf.setDrawColor(0, 0, 255); // Blue border
              pdf.setLineWidth(0.5);
              pdf.rect(
                finalPdfX,
                finalPdfY,
                scaledLinkWidth,
                scaledLinkHeight,
                'FD', // Fill and Draw
              );
              if (DEBUG_LOGGING) {
                console.log(
                  `[addLinksToPDF Debug Rect] Drew rect for link ${
                    index + 1
                  } on page ${targetPageNumber}:`,
                  {
                    url: link.url,
                    finalPdfX,
                    finalPdfY,
                    scaledLinkWidth,
                    scaledLinkHeight,
                  },
                );
              }
            } else {
              // PRODUCTION: Add the actual clickable link annotation
              pdf.link(
                finalPdfX,
                finalPdfY,
                scaledLinkWidth,
                scaledLinkHeight,
                { url: link.url },
              );
              if (DEBUG_LOGGING) {
                console.log(
                  `[addLinksToPDF] Added link ${
                    index + 1
                  } on page ${targetPageNumber}:`,
                  {
                    url: link.url,
                    originalPx: {
                      x: link.x,
                      y: link.y,
                      width: link.width,
                      height: link.height,
                    },
                    scaleFactors: {
                      x: pixelToPdfScaleX.toFixed(4),
                      y: pixelToPdfScaleY.toFixed(4),
                    },
                    scaledMm: {
                      x: absoluteScaledLinkX.toFixed(2),
                      y: absoluteScaledLinkY.toFixed(2),
                      width: scaledLinkWidth.toFixed(2),
                      height: scaledLinkHeight.toFixed(2),
                    },
                    finalPdfMm: {
                      x: finalPdfX.toFixed(2),
                      y: finalPdfY.toFixed(2),
                    },
                    pageCalculatedY: yOnCurrentPageContentArea.toFixed(2),
                  },
                );
              }
            }
          } catch (error) {
            console.error(
              `[addLinksToPDF Error] Failed to add link ${link.url} on page ${targetPageNumber}:`,
              error,
            );
          }
        } else {
          if (DEBUG_LOGGING) {
            console.warn(
              `[addLinksToPDF Skip] Skipping link ${index + 1} (${
                link.url
              }) as it's out of bounds on page ${targetPageNumber}. ` +
                `Calculated Final PDF Y: ${finalPdfY.toFixed(
                  2,
                )}mm, Height: ${scaledLinkHeight.toFixed(2)}mm. ` +
                `Page Content Area Y Range: ${pdfOptions.marginTop.toFixed(
                  2,
                )}mm to ${(pdfOptions.marginTop + contentHeight).toFixed(2)}mm`,
            );
          }
        }
      });
    },
    [
      pdfOptions.enableLinks,
      pdfOptions.marginLeft,
      pdfOptions.marginTop,
      pdfOptions.marginBottom,
      DEBUG_LINKS_RECTS,
      DEBUG_LOGGING,
    ],
  );

  /**
   * Core function to create a canvas from the content element and prepare data for PDF/Image export.
   * @returns An object containing all necessary dimensions and data.
   */
  const createContentCapture = useCallback(async () => {
    const element = document.getElementById(contentId);
    if (!element) {
      throw new Error('Content element not found');
    }

    // --- Capture & Restore Original Styles ---
    // Store original styles to revert after html2canvas capture.
    // This is especially important if you temporarily modify `element.style.width`.
    const originalElementStyle = element.style.cssText;
    // const originalElementWidth = element.style.width; // Store original width

    // Temporarily set a specific width for consistent rendering if not already set by parent
    // The parent ExportDialog sets 'width: 700px' on the hidden div.
    // We should rely on that or enforce our own if needed.
    // If pdfOptions.width is 0, html2canvas will use element.scrollWidth, which might vary.
    // To ensure consistency, we can explicitly set element's width here.
    // However, if the parent div already sets a fixed width, relying on that is cleaner.
    // Assuming `ExportDialog`'s hidden div has `width: '700px'`, `element.offsetWidth` will reflect this.
    // If you ever remove the `width: '700px'` from the hidden div in `ExportDialog`, uncomment and adjust this:
    // element.style.width = '700px'; // Or a suitable default width for your resume layout
    // element.style.boxSizing = 'border-box'; // Crucial for consistent width calculation

    // --- NEW: Small delay to allow DOM to settle and render fully ---
    // This is crucial for accurate getBoundingClientRect and html2canvas capture,
    // especially with dynamic content or complex CSS.
    if (DEBUG_LOGGING)
      console.log('[createContentCapture] Delaying for DOM stability...');
    await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay, adjust as needed

    // --- NEW: Get element's current bounding rect AFTER delay and any temporary style changes ---
    const elementRect = element.getBoundingClientRect();
    if (DEBUG_LOGGING)
      console.log(
        '[createContentCapture] Element Bounding Rect (after delay):',
        elementRect,
      );

    // Extract links using the *current* element's bounding rect
    const links = extractLinks(element, elementRect); // Pass element and its rect

    // --- html2canvas Capture ---
    const canvas = await html2canvas(element, {
      scale: pdfOptions.scale,
      useCORS: pdfOptions.useCORS,
      allowTaint: pdfOptions.allowTaint,
      backgroundColor: pdfOptions.backgroundColor,
      logging: DEBUG_LOGGING || process.env.NODE_ENV === 'development', // Enable html2canvas logs in dev or when DEBUG_LOGGING is true
      // Explicitly set target width/height based on the element's *actual rendered size*
      // This ensures html2canvas renders based on its current, stable DOM state.
      width: element.offsetWidth,
      height: element.offsetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth, // Important for relative units (vw/vh) within the content
      windowHeight: window.innerHeight,
      imageTimeout: 15000,
      removeContainer: true, // html2canvas will create a temp div and remove it
    });

    // --- Restore Original Styles ---
    element.style.cssText = originalElementStyle; // Restore all original inline styles
    // If you set a temp width, restore it
    // element.style.width = originalElementWidth;
    // element.style.removeProperty('box-sizing'); // Clean up if you added this

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error(t('export.errorCanvasDimensions'));
    }
    if (DEBUG_LOGGING)
      console.log('[createContentCapture] Canvas created:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        html2canvasScale: pdfOptions.scale,
      });

    const imgData = canvas.toDataURL(
      pdfOptions.imageFormat === 'png' ? 'image/png' : 'image/jpeg',
      pdfOptions.quality,
    );

    const pageDimensions = getPageDimensions(); // Dimensions of the PDF page in mm
    const pageWidth = pageDimensions.width;
    const pageHeight = pageDimensions.height;

    // Calculate the available content area on a single PDF page (after margins) in mm
    const contentWidth =
      pageWidth - pdfOptions.marginLeft - pdfOptions.marginRight;
    const contentHeight =
      pageHeight - pdfOptions.marginTop - pdfOptions.marginBottom;

    // Calculate the final image dimensions in mm to fit the PDF content area, maintaining aspect ratio.
    // `imgWidth` is set to the full available `contentWidth` of a PDF page.
    // `imgHeight` is scaled proportionally.
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (DEBUG_LOGGING) {
      console.log(
        '[createContentCapture] Element Offsets (html2canvas input):',
        {
          offsetWidth: element.offsetWidth,
          offsetHeight: element.offsetHeight,
        },
      );
      console.log(
        '[createContentCapture] Element Bounding Rect (links source):',
        {
          width: elementRect.width,
          height: elementRect.height,
        },
      );
      console.log(
        '[createContentCapture] Calculated PDF Image & Page Dimensions:',
        {
          contentWidth_mm: contentWidth,
          contentHeight_mm: contentHeight,
          imgWidth_mm: imgWidth,
          imgHeight_mm: imgHeight,
          pageWidth_mm: pageWidth,
          pageHeight_mm: pageHeight,
        },
      );
    }

    return {
      imgData,
      imgWidth, // Total width of the generated image in PDF mm
      imgHeight, // Total height of the generated image in PDF mm
      capturedCanvasWidthPx: canvas.width, // Actual pixel width of the canvas (includes html2canvas.scale)
      capturedCanvasHeightPx: canvas.height, // Actual pixel height of the canvas (includes html2canvas.scale)
      contentWidth, // Available content width on a single PDF page (mm)
      contentHeight, // Available content height on a single PDF page (mm)
      pageWidth, // Total PDF page width (mm)
      pageHeight, // Total PDF page height (mm)
      links, // Original links extracted
    };
  }, [
    contentId,
    pdfOptions,
    t,
    extractLinks,
    getPageDimensions,
    DEBUG_LOGGING,
  ]);

  const handleExport = useCallback(async () => {
    setIsGenerating(true);
    try {
      const {
        imgData,
        imgWidth,
        imgHeight,
        capturedCanvasWidthPx,
        capturedCanvasHeightPx,
        contentWidth,
        contentHeight,
        links, // Only need links here
      } = await createContentCapture();

      if (mode === 'image') {
        const link = document.createElement('a');
        // Ensure correct file extension for image download
        link.download = `${pdfOptions.filename.replace(/\.pdf$/, '')}.${
          pdfOptions.imageFormat
        }`;
        link.href = imgData;
        document.body.appendChild(link); // Append to body to make it clickable on iOS Safari
        link.click();
        document.body.removeChild(link); // Clean up
        toast.success(t('export.success'), {
          description: `${pdfOptions.filename.replace(/\.pdf$/, '')}.${
            pdfOptions.imageFormat
          } ${t('export.downloadedSuccessfully')}`,
        });
      } else {
        // mode === "pdf"
        const pdf = new jsPDF({
          orientation: pdfOptions.orientation as 'portrait' | 'landscape',
          unit: 'mm',
          format: pdfOptions.format,
          compress: pdfOptions.compress,
          precision: 2,
        });

        pdf.setProperties({
          title: pdfOptions.filename.replace('.pdf', ''),
          subject: 'Generated Document',
          author: 'Application Name',
          creator: 'Application Name',
          // @ts-expect-error producer is a valid property but not in the type definition
          producer: 'jsPDF',
        });

        let currentImgPosition = 0; // Tracks how much of the original image height has been rendered
        let pagesAdded = 0;

        // Add the image content to PDF pages
        while (currentImgPosition < imgHeight) {
          if (pagesAdded > 0) {
            pdf.addPage();
          }
          pdf.addImage(
            imgData,
            pdfOptions.imageFormat.toUpperCase() as 'JPEG' | 'PNG',
            pdfOptions.marginLeft,
            // Shift the image up by `currentImgPosition` for subsequent pages to show next slice
            pdfOptions.marginTop - currentImgPosition,
            imgWidth,
            imgHeight,
          );
          currentImgPosition += contentHeight; // Move to the start of the next page's content area
          pagesAdded++;
        }

        // Add clickable links after all image content is laid out
        if (pdfOptions.enableLinks) {
          addLinksToPDF(
            pdf,
            links,
            contentWidth,
            contentHeight,
            imgWidth,
            imgHeight,
            capturedCanvasWidthPx,
            capturedCanvasHeightPx, // Pass the actual canvas dimensions
          );
        }

        pdf.save(pdfOptions.filename);
        toast.success(t('export.success'), {
          description: `${pdfOptions.filename} ${t(
            'export.downloadedSuccessfully',
          )}`,
        });
      }
      onOpenChange(false); // Close this dialog on successful export/download
    } catch (error) {
      console.error('[handleExport Error]', error);
      toast.error(t('export.error'), {
        description:
          error instanceof Error
            ? error.message
            : t('export.unknownErrorMessage'),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    createContentCapture,
    pdfOptions,
    mode,
    t,
    addLinksToPDF,
    setIsGenerating,
    onOpenChange,
  ]);

  const handlePreviewPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const {
        imgData,
        imgWidth,
        imgHeight,
        capturedCanvasWidthPx,
        capturedCanvasHeightPx,
        contentWidth,
        contentHeight,
        links, // Only need links here
      } = await createContentCapture();

      const pdf = new jsPDF({
        orientation: pdfOptions.orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: pdfOptions.format,
        compress: pdfOptions.compress,
        precision: 2,
      });

      let currentImgPosition = 0;
      let pagesAdded = 0;

      while (currentImgPosition < imgHeight) {
        if (pagesAdded > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          imgData,
          pdfOptions.imageFormat.toUpperCase() as 'JPEG' | 'PNG',
          pdfOptions.marginLeft, // Image X on PDF page
          pdfOptions.marginTop - currentImgPosition, // Image Y on PDF page
          imgWidth, // Total width of the image
          imgHeight, // Total height of the image (can be multiple pages long)
        );
        currentImgPosition += contentHeight;
        pagesAdded++;
      }

      if (pdfOptions.enableLinks) {
        addLinksToPDF(
          pdf,
          links,
          contentWidth,
          contentHeight,
          imgWidth,
          imgHeight,
          capturedCanvasWidthPx,
          capturedCanvasHeightPx, // Pass the actual canvas dimensions
        );
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      toast.success(t('export.previewOpened'), {
        description: t('export.previewOpenedDesc'),
      });
    } catch (error) {
      console.error('[handlePreviewPDF Error]', error);
      toast.error(t('export.error'), {
        description:
          error instanceof Error
            ? error.message
            : t('export.unknownErrorMessage'),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [createContentCapture, pdfOptions, t, addLinksToPDF, setIsGenerating]);

  const handleOptionChange = useCallback(
    <K extends keyof typeof DEFAULT_PDF_OPTIONS>(
      key: K,
      value: (typeof DEFAULT_PDF_OPTIONS)[K],
    ) => {
      setPdfOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    // Dialog is now controlled by the 'open' prop from the parent
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='mx-4 max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-lg sm:text-xl'>
            {mode === 'image'
              ? t('export.advancedImageTitle')
              : t('export.advancedPDFTitle')}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4'>
            <TabsTrigger value='basic' className='text-xs sm:text-sm'>
              {t('export.basic')}
            </TabsTrigger>
            <TabsTrigger value='layout' className='text-xs sm:text-sm'>
              {t('export.layout')}
            </TabsTrigger>
            <TabsTrigger value='quality' className='text-xs sm:text-sm'>
              {t('export.quality')}
            </TabsTrigger>
            <TabsTrigger value='advanced' className='text-xs sm:text-sm'>
              {t('export.advanced')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex items-center gap-2'>
                  <Settings className='size-4' />
                  <h3 className='font-semibold'>{t('export.basicSettings')}</h3>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='filename'>
                      {mode === 'image'
                        ? t('export.imageFilename')
                        : t('export.filename')}
                    </Label>
                    <Input
                      id='filename'
                      value={pdfOptions.filename}
                      onChange={(e) =>
                        handleOptionChange('filename', e.target.value)
                      }
                      placeholder={
                        mode === 'image' ? 'resume.png' : 'resume.pdf'
                      }
                    />
                  </div>
                  {mode === 'pdf' && (
                    <div className='space-y-2'>
                      <Label htmlFor='format'>{t('export.pageFormat')}</Label>
                      <Select
                        value={pdfOptions.format}
                        onValueChange={(value) =>
                          handleOptionChange('format', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAGE_FORMATS).map(
                            ([key, { width, height }]) => (
                              <SelectItem key={key} value={key}>
                                {key.toUpperCase()} ({width}×{height}mm)
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {mode === 'pdf' && (
                    <div className='space-y-2'>
                      <Label htmlFor='orientation'>
                        {t('export.orientation')}
                      </Label>
                      <Select
                        value={pdfOptions.orientation}
                        onValueChange={(value) =>
                          handleOptionChange('orientation', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='portrait'>
                            {t('export.portrait')}
                          </SelectItem>
                          <SelectItem value='landscape'>
                            {t('export.landscape')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='imageFormat'>
                      {t('export.imageFormat')}
                    </Label>
                    <Select
                      value={pdfOptions.imageFormat}
                      onValueChange={(value) =>
                        handleOptionChange(
                          'imageFormat',
                          value as 'jpeg' | 'png',
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='jpeg'>
                          {t('export.jpegFormat')}
                        </SelectItem>
                        <SelectItem value='png'>
                          {t('export.pngFormat')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='layout' className='space-y-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex items-center gap-2'>
                  <Layout className='size-4' />
                  <h3 className='font-semibold'>
                    {mode === 'image'
                      ? t('export.imageLayoutSettings')
                      : t('export.layoutMargins')}
                  </h3>
                </div>

                {mode === 'pdf' && (
                  <div className='mb-4 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='marginTop'>{t('export.topMargin')}</Label>
                      <Input
                        id='marginTop'
                        type='number'
                        value={pdfOptions.marginTop}
                        onChange={(e) =>
                          handleOptionChange(
                            'marginTop',
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        min='0'
                        max='50'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='marginBottom'>
                        {t('export.bottomMargin')}
                      </Label>
                      <Input
                        id='marginBottom'
                        type='number'
                        value={pdfOptions.marginBottom}
                        onChange={(e) =>
                          handleOptionChange(
                            'marginBottom',
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        min='0'
                        max='50'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='marginLeft'>
                        {t('export.leftMargin')}
                      </Label>
                      <Input
                        id='marginLeft'
                        type='number'
                        value={pdfOptions.marginLeft}
                        onChange={(e) =>
                          handleOptionChange(
                            'marginLeft',
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        min='0'
                        max='50'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='marginRight'>
                        {t('export.rightMargin')}
                      </Label>
                      <Input
                        id='marginRight'
                        type='number'
                        value={pdfOptions.marginRight}
                        onChange={(e) =>
                          handleOptionChange(
                            'marginRight',
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        min='0'
                        max='50'
                      />
                    </div>
                  </div>
                )}

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='width'>{t('export.contentWidth')}</Label>
                    <Input
                      id='width'
                      type='number'
                      value={pdfOptions.width}
                      onChange={(e) =>
                        handleOptionChange(
                          'width',
                          Number.parseInt(e.target.value) || 0,
                        )
                      }
                      min='0'
                      max='2000'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='backgroundColor'>
                      {t('export.backgroundColor')}
                    </Label>
                    <Input
                      id='backgroundColor'
                      type='color'
                      value={pdfOptions.backgroundColor}
                      onChange={(e) =>
                        handleOptionChange('backgroundColor', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='quality' className='space-y-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex items-center gap-2'>
                  <ImageIcon className='size-4' />
                  <h3 className='font-semibold'>
                    {t('export.qualitySettings')}
                  </h3>
                </div>

                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <Label>
                      {t('export.scaleFactor')}: {pdfOptions.scale}x
                    </Label>
                    <Slider
                      value={[pdfOptions.scale]}
                      onValueChange={(value) =>
                        handleOptionChange('scale', value[0])
                      }
                      max={4}
                      min={1}
                      step={0.5}
                      className='w-full'
                    />
                    <p className='text-xs text-gray-500'>
                      {t('export.scaleDescription')}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label>
                      {t('export.imageQuality')}:{' '}
                      {Math.round(pdfOptions.quality * 100)}%
                    </Label>
                    <Slider
                      value={[pdfOptions.quality]}
                      onValueChange={(value) =>
                        handleOptionChange('quality', value[0])
                      }
                      max={1}
                      min={0.1}
                      step={0.05}
                      className='w-full'
                    />
                    <p className='text-xs text-gray-500'>
                      {t('export.qualityDescription')}
                    </p>
                  </div>

                  {mode === 'pdf' && (
                    <div className='space-y-2'>
                      <Label htmlFor='dpi'>{t('export.dpi')}</Label>
                      <Select
                        value={pdfOptions.dpi.toString()}
                        onValueChange={(value) =>
                          handleOptionChange('dpi', Number.parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='150'>
                            {t('export.dpi150')}
                          </SelectItem>
                          <SelectItem value='300'>
                            {t('export.dpi300')}
                          </SelectItem>
                          <SelectItem value='600'>
                            {t('export.dpi600')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='advanced' className='space-y-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex items-center gap-2'>
                  <Settings className='size-4' />
                  <h3 className='font-semibold'>
                    {t('export.advancedOptions')}
                  </h3>
                </div>

                <div className='space-y-4'>
                  {mode === 'pdf' && (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='compress'
                        checked={pdfOptions.compress}
                        onCheckedChange={(checked) =>
                          handleOptionChange('compress', !!checked)
                        }
                      />
                      <Label htmlFor='compress'>
                        {t('export.compressPDF')}
                      </Label>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='useCORS'
                      checked={pdfOptions.useCORS}
                      onCheckedChange={(checked) =>
                        handleOptionChange('useCORS', !!checked)
                      }
                    />
                    <Label htmlFor='useCORS'>{t('export.useCORS')}</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='allowTaint'
                      checked={pdfOptions.allowTaint}
                      onCheckedChange={(checked) =>
                        handleOptionChange('allowTaint', !!checked)
                      }
                    />
                    <Label htmlFor='allowTaint'>{t('export.allowTaint')}</Label>
                  </div>

                  {mode === 'pdf' && (
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='enableLinks'
                        checked={pdfOptions.enableLinks}
                        onCheckedChange={(checked) =>
                          handleOptionChange('enableLinks', !!checked)
                        }
                      />
                      <Label htmlFor='enableLinks'>
                        {t('export.enableLinks')}
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='flex flex-col gap-4 pt-4 sm:flex-row'>
          {mode === 'pdf' && (
            <Button
              onClick={handlePreviewPDF}
              disabled={isGenerating}
              variant='outline'
              className='flex-1'
            >
              <FileText className='mr-2 size-4' />
              {isGenerating ? t('export.generating') : t('export.previewPDF')}
            </Button>
          )}

          <Button
            onClick={handleExport}
            disabled={isGenerating}
            className='flex-1'
          >
            <Download className='mr-2 size-4' />
            {isGenerating
              ? t('export.generating')
              : mode === 'image'
                ? t('export.downloadImage')
                : t('export.downloadPDF')}
          </Button>
        </div>

        <div className='space-y-2 border-t pt-4 text-sm text-gray-600'>
          <p>
            <strong>{t('export.tipsTitle')}:</strong>
          </p>
          <ul className='list-inside list-disc space-y-1 text-xs'>
            <li>{t('export.tip1')}</li>
            <li>{t('export.tip2')}</li>
            <li>{t('export.tip3')}</li>
            <li>{t('export.tip4')}</li>
            <li>{t('export.tip5')}</li>
            <li>{t('export.tip6')}</li>
            <li>
              **{t('export.importantTip')}**: {t('export.listStylePositionTip')}
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
