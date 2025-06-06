"use client";

import { useCallback, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText, Settings, ImageIcon, Layout } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

interface PDFExporterProps {
  contentId: string;
  filename: string;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LinkInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  page: number;
}

const DEFAULT_PDF_OPTIONS = {
  // Basic settings
  format: "a4",
  orientation: "portrait",
  filename: "",

  // Margins (in mm)
  marginTop: 7,
  marginBottom: 7,
  marginLeft: 7,
  marginRight: 7,

  // Canvas/Image settings
  scale: 2,
  quality: 0.95,
  imageFormat: "jpeg",
  backgroundColor: "#ffffff",

  // Advanced settings
  dpi: 300,
  compress: true,
  enableLinks: true,
  useCORS: true,
  allowTaint: false,

  // Content settings
  width: 0, // 0 = auto
  height: 0, // 0 = auto

  // Page break settings
  pageBreakBefore: "",
  pageBreakAfter: "",
  avoidPageBreak: true,
};

export function PDFExporter({
  contentId,
  filename,
  isGenerating,
  setIsGenerating,
  open: dialogOpen,
  onOpenChange: setDialogOpen,
}: PDFExporterProps) {
  const { t } = useTranslation();
  const [pdfOptions, setPdfOptions] = useState({
    ...DEFAULT_PDF_OPTIONS,
    filename: filename,
  });

  const getPageDimensions = () => {
    const formats = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      a5: { width: 148, height: 210 },
      letter: { width: 216, height: 279 },
      legal: { width: 216, height: 356 },
      tabloid: { width: 279, height: 432 },
    };

    const format =
      formats[pdfOptions.format as keyof typeof formats] || formats.a4;

    if (pdfOptions.orientation === "landscape") {
      return { width: format.height, height: format.width };
    }

    return format;
  };

  const extractLinks = useCallback(
    (element: HTMLElement): LinkInfo[] => {
      const links: LinkInfo[] = [];
      if (!pdfOptions.enableLinks) return links;

      const linkElements = element.querySelectorAll("a[href]");
      const elementRect = element.getBoundingClientRect();

      linkElements.forEach((linkElement) => {
        const anchor = linkElement as HTMLAnchorElement;
        const rect = anchor.getBoundingClientRect();

        if (anchor.href && rect.width > 0 && rect.height > 0) {
          const relativeX = rect.left - elementRect.left;
          const relativeY = rect.top - elementRect.top;

          links.push({
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
            url: anchor.href,
            page: 0, // Will be calculated later based on Y position
          });
        }
      });
      return links;
    },
    [pdfOptions.enableLinks]
  );

  const addLinksToPDF = useCallback(
    (
      pdf: jsPDF,
      links: LinkInfo[],
      contentWidth: number, // Width of content area on PDF page (in mm)
      contentHeight: number, // Height of content area on PDF page (in mm)
      imgWidth: number, // Total width of the scaled image (in mm)
      imgHeight: number, // Total height of the scaled image (in mm)
      canvasWidth: number, // Original canvas pixel width
      canvasHeight: number // Original canvas pixel height
    ) => {
      if (links.length === 0) return;

      // These scales convert original pixel dimensions to millimeters on the final PDF image.
      const pixelToPdfScaleX = imgWidth / canvasWidth;
      const pixelToPdfScaleY = imgHeight / canvasHeight;

      links.forEach((link) => {
        // 1. Calculate the link's absolute position and dimensions in PDF millimeters,
        //    relative to the top-left of the *entire content image*.
        const absoluteScaledLinkX = link.x * pixelToPdfScaleX;
        const absoluteScaledLinkY = link.y * pixelToPdfScaleY;
        const scaledLinkWidth = link.width * pixelToPdfScaleX;
        const scaledLinkHeight = link.height * pixelToPdfScaleY;

        // 2. Determine which PDF page this link belongs to.
        //    `absoluteScaledLinkY` is the Y from the top of the entire content.
        //    `contentHeight` is the height of the printable area on *one* PDF page.
        const pageIndex = Math.floor(absoluteScaledLinkY / contentHeight);
        const targetPageNumber = pageIndex + 1; // jsPDF pages are 1-indexed

        // 3. Calculate the link's Y position *relative to the top of its specific PDF page*.
        //    We need to subtract the height of all full preceding pages from `absoluteScaledLinkY`.
        const yOnCurrentPage = absoluteScaledLinkY % contentHeight;

        // 4. Add the PDF margins to get the final coordinates on the PDF page.
        const finalPdfX = pdfOptions.marginLeft + absoluteScaledLinkX;
        const finalPdfY = pdfOptions.marginTop + yOnCurrentPage;

        // Ensure the link is within the bounds of a logical page content area
        // This is a crucial check to prevent mispositioned links or errors.
        if (
          finalPdfX >= pdfOptions.marginLeft && // Check horizontal left boundary
          finalPdfX + scaledLinkWidth <= pdfOptions.marginLeft + contentWidth && // Check horizontal right boundary
          finalPdfY >= pdfOptions.marginTop && // Check vertical top boundary
          finalPdfY + scaledLinkHeight <= pdfOptions.marginTop + contentHeight // Check vertical bottom boundary
        ) {
          try {
            // IMPORTANT: Set the page context before adding the link
            pdf.setPage(targetPageNumber);

            pdf.link(finalPdfX, finalPdfY, scaledLinkWidth, scaledLinkHeight, {
              url: link.url,
            });

            console.log(`Added link on page ${targetPageNumber}:`, {
              url: link.url,
              originalX: link.x,
              originalY: link.y,
              finalPdfX,
              finalPdfY,
              width: scaledLinkWidth,
              height: scaledLinkHeight,
              pageCalculatedY: yOnCurrentPage, // Y relative to current page content top
            });
          } catch (error) {
            console.warn(
              `Failed to add link ${link.url} on page ${targetPageNumber}:`,
              error
            );
          }
        } else {
          // console.log(`Skipping link ${link.url} (out of bounds on page ${targetPageNumber}):`, {
          //   url: link.url,
          //   absoluteScaledLinkX,
          //   absoluteScaledLinkY,
          //   scaledLinkWidth,
          //   scaledLinkHeight,
          //   finalPdfX,
          //   finalPdfY,
          //   contentArea: {
          //     x: pdfOptions.marginLeft,
          //     y: pdfOptions.marginTop,
          //     width: contentWidth,
          //     height: contentHeight,
          //   },
          // });
        }
      });
    },
    [
      pdfOptions.enableLinks,
      pdfOptions.marginLeft,
      pdfOptions.marginTop,
      pdfOptions.marginBottom, // Keep for comprehensive boundary check
    ]
  );

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById(contentId);
      if (!element) {
        console.error(`Element with ID "${contentId}" not found`);
        toast.error(t("export.error"), {
          description: `Content element with ID "${contentId}" not found.`,
        });
        return;
      }

      console.log("Found element:", element);
      console.log("PDF Options:", pdfOptions);

      // Extract links before creating canvas
      const links = pdfOptions.enableLinks ? extractLinks(element) : [];

      // Get page dimensions
      const pageDimensions = getPageDimensions();
      const pageWidth = pageDimensions.width;
      const pageHeight = pageDimensions.height;

      // Calculate content area
      const contentWidth =
        pageWidth - pdfOptions.marginLeft - pdfOptions.marginRight;
      const contentHeight =
        pageHeight - pdfOptions.marginTop - pdfOptions.marginBottom;

      console.log("Page dimensions:", {
        pageWidth,
        pageHeight,
        contentWidth,
        contentHeight,
      });

      // Prepare element for capture
      const originalStyle = element.style.cssText;

      // Set fixed width for consistent rendering
      if (pdfOptions.width > 0) {
        element.style.width = `${pdfOptions.width}px`;
      }

      // Create canvas with enhanced options
      const canvas = await html2canvas(element, {
        scale: pdfOptions.scale,
        useCORS: pdfOptions.useCORS,
        allowTaint: pdfOptions.allowTaint,
        backgroundColor: pdfOptions.backgroundColor,
        logging: true,
        width: pdfOptions.width > 0 ? pdfOptions.width : element.scrollWidth,
        height:
          pdfOptions.height > 0 ? pdfOptions.height : element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        imageTimeout: 15000,
        removeContainer: true,
      });

      // Restore original style
      element.style.cssText = originalStyle;

      console.log("Canvas created:", {
        width: canvas.width,
        height: canvas.height,
        scale: pdfOptions.scale,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(
          "Canvas has zero dimensions. Element might be hidden or have no content."
        );
      }

      // Convert to image data
      const imgData = canvas.toDataURL(
        pdfOptions.imageFormat === "png" ? "image/png" : "image/jpeg",
        pdfOptions.quality
      );

      // Calculate image dimensions for PDF
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      console.log("Image dimensions:", { imgWidth, imgHeight });

      // Create PDF with enhanced settings
      const pdf = new jsPDF({
        orientation: pdfOptions.orientation as "portrait" | "landscape",
        unit: "mm",
        format: pdfOptions.format,
        compress: pdfOptions.compress,
        precision: 2,
      });

      // Add metadata
      pdf.setProperties({
        title: pdfOptions.filename.replace(".pdf", ""),
        subject: "Generated Resume",
        author: "Resume Builder",
        creator: "Resume Builder",
        // @ts-expect-error Object literal may only specify known properties, and 'producer' does not exist in type 'DocumentProperties'.ts(2353)
        producer: "jsPDF",
      });

      // Calculate pages needed
      const pageContentHeight = contentHeight;
      let position = 0;
      let remainingHeight = imgHeight;

      // Add first page
      pdf.addImage(
        imgData,
        pdfOptions.imageFormat.toUpperCase() as "JPEG" | "PNG",
        pdfOptions.marginLeft,
        pdfOptions.marginTop,
        imgWidth,
        Math.min(imgHeight, pageContentHeight)
      );

      remainingHeight -= pageContentHeight;

      // Add additional pages if needed
      while (remainingHeight > 0) {
        position += pageContentHeight;
        pdf.addPage();

        const currentPageHeight = Math.min(remainingHeight, pageContentHeight);

        pdf.addImage(
          imgData,
          pdfOptions.imageFormat.toUpperCase() as "JPEG" | "PNG",
          pdfOptions.marginLeft,
          pdfOptions.marginTop - position,
          imgWidth,
          imgHeight
        );

        remainingHeight -= pageContentHeight;
      }

      // Add clickable links
      if (pdfOptions.enableLinks && links.length > 0) {
        console.log("Adding clickable links to PDF...");
        addLinksToPDF(
          pdf,
          links,
          contentWidth,
          contentHeight,
          imgWidth,
          imgHeight,
          canvas.width,
          canvas.height
        );
      }

      // Save the PDF
      pdf.save(pdfOptions.filename);
      setDialogOpen(false);

      toast.success(t("export.success"), {
        description: `${pdfOptions.filename} ${t(
          "export.downloadedSuccessfully"
        )}`,
      });

      console.log("PDF saved successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("export.error"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async () => {
    setIsGenerating(true);

    try {
      // Same logic as generatePDF but open in new tab instead of saving
      const element = document.getElementById(contentId);
      if (!element) {
        throw new Error(`Element with ID "${contentId}" not found`);
      }

      // Extract links before creating canvas
      const links = pdfOptions.enableLinks ? extractLinks(element) : [];

      const pageDimensions = getPageDimensions();
      const pageWidth = pageDimensions.width;
      const pageHeight = pageDimensions.height;
      const contentWidth =
        pageWidth - pdfOptions.marginLeft - pdfOptions.marginRight;
      const contentHeight =
        pageHeight - pdfOptions.marginTop - pdfOptions.marginBottom;

      const originalStyle = element.style.cssText;
      if (pdfOptions.width > 0) {
        element.style.width = `${pdfOptions.width}px`;
      }

      const canvas = await html2canvas(element, {
        scale: pdfOptions.scale,
        useCORS: pdfOptions.useCORS,
        allowTaint: pdfOptions.allowTaint,
        backgroundColor: pdfOptions.backgroundColor,
        logging: true,
        width: pdfOptions.width > 0 ? pdfOptions.width : element.scrollWidth,
        height:
          pdfOptions.height > 0 ? pdfOptions.height : element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        imageTimeout: 15000,
        removeContainer: true,
      });

      element.style.cssText = originalStyle;

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas has zero dimensions");
      }

      const imgData = canvas.toDataURL(
        pdfOptions.imageFormat === "png" ? "image/png" : "image/jpeg",
        pdfOptions.quality
      );

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: pdfOptions.orientation as "portrait" | "landscape",
        unit: "mm",
        format: pdfOptions.format,
        compress: pdfOptions.compress,
        precision: 2,
      });

      const pageContentHeight = contentHeight;
      let position = 0;
      let remainingHeight = imgHeight;

      pdf.addImage(
        imgData,
        pdfOptions.imageFormat.toUpperCase() as "JPEG" | "PNG",
        pdfOptions.marginLeft,
        pdfOptions.marginTop,
        imgWidth,
        Math.min(imgHeight, pageContentHeight)
      );

      remainingHeight -= pageContentHeight;

      while (remainingHeight > 0) {
        position += pageContentHeight;
        pdf.addPage();

        pdf.addImage(
          imgData,
          pdfOptions.imageFormat.toUpperCase() as "JPEG" | "PNG",
          pdfOptions.marginLeft,
          pdfOptions.marginTop - position,
          imgWidth,
          imgHeight
        );

        remainingHeight -= pageContentHeight;
      }

      // Add clickable links
      if (pdfOptions.enableLinks && links.length > 0) {
        console.log("Adding clickable links to preview PDF...");
        addLinksToPDF(
          pdf,
          links,
          contentWidth,
          contentHeight,
          imgWidth,
          imgHeight,
          canvas.width,
          canvas.height
        );
      }

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      toast.success(t("export.previewOpened"), {
        description: t("export.previewOpenedDesc"),
      });
    } catch (error) {
      console.error("Error previewing PDF:", error);
      toast.error(t("export.error"), {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {t("export.advancedPDFTitle")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">
              {t("export.basic")}
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs sm:text-sm">
              {t("export.layout")}
            </TabsTrigger>
            <TabsTrigger value="quality" className="text-xs sm:text-sm">
              {t("export.quality")}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs sm:text-sm">
              {t("export.advanced")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold">{t("export.basicSettings")}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filename">{t("export.filename")}</Label>
                    <Input
                      id="filename"
                      value={pdfOptions.filename}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          filename: e.target.value,
                        }))
                      }
                      placeholder="resume.pdf"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">{t("export.pageFormat")}</Label>
                    <Select
                      value={pdfOptions.format}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210×297mm)</SelectItem>
                        <SelectItem value="a3">A3 (297×420mm)</SelectItem>
                        <SelectItem value="a5">A5 (148×210mm)</SelectItem>
                        <SelectItem value="letter">
                          Letter (216×279mm)
                        </SelectItem>
                        <SelectItem value="legal">Legal (216×356mm)</SelectItem>
                        <SelectItem value="tabloid">
                          Tabloid (279×432mm)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">
                      {t("export.orientation")}
                    </Label>
                    <Select
                      value={pdfOptions.orientation}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          orientation: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">
                          {t("export.portrait")}
                        </SelectItem>
                        <SelectItem value="landscape">
                          {t("export.landscape")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageFormat">
                      {t("export.imageFormat")}
                    </Label>
                    <Select
                      value={pdfOptions.imageFormat}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          imageFormat: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpeg">
                          {t("export.jpegFormat")}
                        </SelectItem>
                        <SelectItem value="png">
                          {t("export.pngFormat")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-4 h-4" />
                  <h3 className="font-semibold">{t("export.layoutMargins")}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marginTop">{t("export.topMargin")}</Label>
                    <Input
                      id="marginTop"
                      type="number"
                      value={pdfOptions.marginTop}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          marginTop: Number.parseInt(e.target.value) || 15,
                        }))
                      }
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marginBottom">
                      {t("export.bottomMargin")}
                    </Label>
                    <Input
                      id="marginBottom"
                      type="number"
                      value={pdfOptions.marginBottom}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          marginBottom: Number.parseInt(e.target.value) || 15,
                        }))
                      }
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marginLeft">{t("export.leftMargin")}</Label>
                    <Input
                      id="marginLeft"
                      type="number"
                      value={pdfOptions.marginLeft}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          marginLeft: Number.parseInt(e.target.value) || 15,
                        }))
                      }
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marginRight">
                      {t("export.rightMargin")}
                    </Label>
                    <Input
                      id="marginRight"
                      type="number"
                      value={pdfOptions.marginRight}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          marginRight: Number.parseInt(e.target.value) || 15,
                        }))
                      }
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">{t("export.contentWidth")}</Label>
                    <Input
                      id="width"
                      type="number"
                      value={pdfOptions.width}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          width: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      max="2000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">
                      {t("export.backgroundColor")}
                    </Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={pdfOptions.backgroundColor}
                      onChange={(e) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          backgroundColor: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4" />
                  <h3 className="font-semibold">
                    {t("export.qualitySettings")}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      {t("export.scaleFactor")}: {pdfOptions.scale}x
                    </Label>
                    <Slider
                      value={[pdfOptions.scale]}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({ ...prev, scale: value[0] }))
                      }
                      max={4}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {t("export.scaleDescription")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {t("export.imageQuality")}:{" "}
                      {Math.round(pdfOptions.quality * 100)}%
                    </Label>
                    <Slider
                      value={[pdfOptions.quality]}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          quality: value[0],
                        }))
                      }
                      max={1}
                      min={0.1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {t("export.qualityDescription")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dpi">{t("export.dpi")}</Label>
                    <Select
                      value={pdfOptions.dpi.toString()}
                      onValueChange={(value) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          dpi: Number.parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">
                          {t("export.dpi150")}
                        </SelectItem>
                        <SelectItem value="300">
                          {t("export.dpi300")}
                        </SelectItem>
                        <SelectItem value="600">
                          {t("export.dpi600")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4" />
                  <h3 className="font-semibold">
                    {t("export.advancedOptions")}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compress"
                      checked={pdfOptions.compress}
                      onCheckedChange={(checked) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          compress: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="compress">{t("export.compressPDF")}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useCORS"
                      checked={pdfOptions.useCORS}
                      onCheckedChange={(checked) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          useCORS: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="useCORS">{t("export.useCORS")}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowTaint"
                      checked={pdfOptions.allowTaint}
                      onCheckedChange={(checked) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          allowTaint: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="allowTaint">{t("export.allowTaint")}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableLinks"
                      checked={pdfOptions.enableLinks}
                      onCheckedChange={(checked) =>
                        setPdfOptions((prev) => ({
                          ...prev,
                          enableLinks: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="enableLinks">
                      {t("export.enableLinks")}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={previewPDF}
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isGenerating ? t("export.generating") : t("export.previewPDF")}
          </Button>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? t("export.generating") : t("export.downloadPDF")}
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
          <p>
            <strong>{t("export.tipsTitle")}:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t("export.tip1")}</li>
            <li>{t("export.tip2")}</li>
            <li>{t("export.tip3")}</li>
            <li>{t("export.tip4")}</li>
            <li>{t("export.tip5")}</li>
            <li>{t("export.tip6")}</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
