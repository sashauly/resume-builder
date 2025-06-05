"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FileText, Plus, Edit, Trash2, Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResumePreview } from "@/components/resume-preview";
import { ExportDialog } from "@/components/export-dialog";
import type { ResumeData } from "@/components/resume-builder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Resume {
  id: string;
  name: string;
  data: ResumeData;
  template: string;
}

export function HomeContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [exportResume, setExportResume] = useState<Resume | null>(null);

  useEffect(() => {
    // Load saved resumes from localStorage
    const loadResumes = () => {
      try {
        const savedResumes = localStorage.getItem("savedResumes");
        if (savedResumes) {
          setResumes(JSON.parse(savedResumes));
        }
      } catch (error) {
        console.error("Failed to load resumes:", error);
      }
    };

    loadResumes();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updatedResumes = resumes.filter((resume) => resume.id !== deleteId);
      setResumes(updatedResumes);
      localStorage.setItem("savedResumes", JSON.stringify(updatedResumes));
      toast.success(t("profile.resumeDeleted"), {
        description: t("profile.resumeDeletedDesc"),
      });
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/builder?id=${id}`);
  };

  const handlePreview = (resume: Resume) => {
    setPreviewResume(resume);
  };

  const handleExport = (resume: Resume | null) => {
    if (resume === null) {
      return;
    }
    setExportResume(resume);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("home.title")}</h1>
        <p className="text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      {resumes.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("home.createResume")}</CardTitle>
              <CardDescription>{t("home.createResumeDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/builder">{t("home.createButton")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{t("home.myResumes")}</h2>
            <Button asChild>
              <Link href="/builder">
                <Plus className="mr-2 h-4 w-4" />
                {t("home.createButton")}
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{resume.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("common.preview")}
                    </Button>
                  </div>
                  <CardDescription>
                    {resume.data.personalInfo.name || "No name"}
                    {resume.data.personalInfo.jobTitle && (
                      <span className="block text-sm text-muted-foreground">
                        {resume.data.personalInfo.jobTitle}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resume.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(resume.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewResume}
        onOpenChange={(open) => !open && setPreviewResume(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewResume?.name}</DialogTitle>
            <DialogDescription>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport(previewResume)}
              >
                <Download className="h-4 w-4" />
                {t("builder.export")}
              </Button>
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md bg-white">
            {previewResume && (
              <div id="resume-preview-export">
                <ResumePreview
                  data={previewResume.data}
                  template={
                    previewResume.template as
                      | "classic"
                      | "modern"
                      | "professional"
                      | "compact"
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {exportResume && (
        <ExportDialog
          open={!!exportResume}
          onOpenChange={(open) => !open && setExportResume(null)}
          resumeData={exportResume.data}
          template={
            exportResume.template as
              | "classic"
              | "modern"
              | "professional"
              | "compact"
          }
          resumeName={exportResume.name}
        />
      )}
    </div>
  );
}
