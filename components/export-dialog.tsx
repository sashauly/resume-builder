"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { Download, FileImage, FileText, File } from "lucide-react";
import type { ResumeData } from "./resume-builder";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  template: "classic" | "modern" | "professional" | "compact";
  resumeName: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  resumeData,
  template,
  resumeName,
}: ExportDialogProps) {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<"pdf" | "image" | "word">(
    "pdf"
  );
  const [isExporting, setIsExporting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const resumeElement = document.getElementById("resume-preview-export");

      if (!resumeElement) {
        throw new Error("Resume element not found");
      }

      // Create a temporary container with white background for export
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.background = "white";
      tempContainer.style.width = "800px"; // Fixed width for better quality
      tempContainer.style.padding = "20px";

      // Clone the resume element into the temp container
      const clone = resumeElement.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Generate canvas from the temp container
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Remove the temp container
      document.body.removeChild(tempContainer);

      // Handle different export formats
      switch (exportFormat) {
        case "pdf":
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          // Calculate the PDF dimensions
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
          pdf.save(`${resumeName || "resume"}.pdf`);
          break;

        case "image":
          // Export as PNG
          const link = document.createElement("a");
          link.download = `${resumeName || "resume"}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          break;

        case "word":
          // Create a simple HTML representation for Word
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${resumeName || "Resume"}</title>
              <style>
                body { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <h1>${resumeData.personalInfo.name || "Resume"}</h1>
              <p>${resumeData.personalInfo.email || ""} | ${
            resumeData.personalInfo.phone || ""
          }</p>
              ${
                resumeData.personalInfo.summary
                  ? `<h2>Summary</h2><p>${resumeData.personalInfo.summary}</p>`
                  : ""
              }
              
              <h2>Experience</h2>
              ${resumeData.experience
                .map(
                  (exp) => `
                <div>
                  <h3>${exp.position} at ${exp.company}</h3>
                  <p>${exp.startDate} - ${
                    exp.current ? "Present" : exp.endDate
                  }</p>
                  <p>${exp.description}</p>
                </div>
              `
                )
                .join("")}
              
              <h2>Education</h2>
              ${resumeData.education
                .map(
                  (edu) => `
                <div>
                  <h3>${edu.degree} ${
                    edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""
                  }</h3>
                  <p>${edu.institution}</p>
                  <p>${edu.startDate} - ${edu.endDate || "Present"}</p>
                </div>
              `
                )
                .join("")}
              
              <h2>Skills</h2>
              <ul>
                ${resumeData.skills
                  .map((skill) => `<li>${skill}</li>`)
                  .join("")}
              </ul>
            </body>
            </html>
          `;

          const blob = new Blob([htmlContent], { type: "application/msword" });
          const wordLink = document.createElement("a");
          wordLink.href = URL.createObjectURL(blob);
          wordLink.download = `${resumeName || "resume"}.doc`;
          wordLink.click();
          break;
      }

      toast.success(t("export.success"), {
        description: `${resumeName || "Resume"}.${exportFormat}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("export.error"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("builder.exportAs")}</DialogTitle>
          <DialogDescription>
            Choose the format for exporting your resume: {resumeName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={exportFormat}
            onValueChange={(value) =>
              setExportFormat(value as "pdf" | "image" | "word")
            }
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="pdf" id="export-pdf" />
                <FileText className="h-5 w-5 text-red-500" />
                <Label htmlFor="export-pdf" className="flex-1">
                  <div>
                    <h3 className="font-medium">{t("builder.exportPDF")}</h3>
                    <p className="text-sm text-muted-foreground">
                      Best for printing and sharing
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="image" id="export-image" />
                <FileImage className="h-5 w-5 text-blue-500" />
                <Label htmlFor="export-image" className="flex-1">
                  <div>
                    <h3 className="font-medium">{t("builder.exportImage")}</h3>
                    <p className="text-sm text-muted-foreground">
                      PNG format for web use
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="word" id="export-word" />
                <File className="h-5 w-5 text-blue-600" />
                <Label htmlFor="export-word" className="flex-1">
                  <div>
                    <h3 className="font-medium">{t("builder.exportWord")}</h3>
                    <p className="text-sm text-muted-foreground">
                      Editable document format
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                {t("export.downloading")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
