'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Download, Import } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ResumePreview } from '@/components/resume-preview';
import { ExportDialog } from '@/components/export/export-dialog';
import type { ResumeData } from '@/components/resume-builder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';

export interface Resume {
  id: string;
  name: string;
  data: ResumeData;
  template: string;
  createdAt: string;
  updatedAt?: string;
}

export function HomeContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [exportResume, setExportResume] = useState<Resume | null>(null);

  useEffect(() => {
    const loadResumes = () => {
      try {
        const savedResumes = localStorage.getItem('savedResumes');
        if (savedResumes) {
          setResumes(JSON.parse(savedResumes));
        }
      } catch (error) {
        console.error('Failed to load resumes:', error);
      }
    };

    loadResumes();
  }, []);

  useEffect(() => {
    if (resumes.length > 0) {
      try {
        localStorage.setItem('savedResumes', JSON.stringify(resumes));
      } catch (error) {
        console.error('Failed to save resumes:', error);
      }
    } else if (localStorage.getItem('savedResumes')) {
      localStorage.removeItem('savedResumes');
    }
  }, [resumes]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updatedResumes = resumes.filter((resume) => resume.id !== deleteId);
      setResumes(updatedResumes);
      localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
      toast.success(t('profile.resumeDeleted'), {
        description: t('profile.resumeDeletedDesc'),
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

  const addResume = (resumeData: ResumeData) => {
    const newResume: Resume = {
      id: uuidv4(),
      name: resumeData.personalInfo.name || 'Untitled Resume',
      data: resumeData,
      template: 'compact',
      createdAt: new Date().toISOString(),
    };

    setResumes((prevResumes) => {
      const updatedResumes = [...prevResumes, newResume];
      return updatedResumes;
    });

    return newResume.id;
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = async (e) => {
      if (!e.target) {
        return;
      }
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          try {
            const resumeData: ResumeData = JSON.parse(result);

            if (
              !resumeData ||
              typeof resumeData !== 'object' ||
              !resumeData.personalInfo
            ) {
              throw new Error('Invalid resume data format.');
            }

            const newResumeId = addResume(resumeData);
            toast.success(t('common.resumeImported'), {
              description: t('common.resumeImportedDesc'),
            });
            router.push(`/builder?id=${newResumeId}`);
          } catch (error) {
            console.error('Failed to import resume:', error);
            toast.error(t('common.errorImportingResume'), {
              description:
                error instanceof Error
                  ? error.message
                  : 'Please ensure the file is a valid JSON resume.',
            });
          } finally {
            document.body.removeChild(input);
          }
        };
        reader.onerror = () => {
          toast.error(t('common.errorReadingFile'), {
            description: t('common.errorReadingFileDesc'),
          });
          document.body.removeChild(input);
        };
        reader.readAsText(file);
      } else {
        document.body.removeChild(input);
      }
    };
    input.click();
  };

  return (
    <>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>{t('home.title')}</h1>
        <p className='text-muted-foreground'>{t('home.subtitle')}</p>
      </div>

      <div className='container mx-auto space-y-2 p-4 md:px-6'>
        {resumes.length === 0 ? (
          <div className='rounded-lg border bg-muted/30 py-12 text-center'>
            <h2 className='mb-2 text-lg font-medium'>
              {t('home.createResume')}
            </h2>
            <p className='mb-4 text-muted-foreground'>
              {t('home.createResumeDesc')}
            </p>

            <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
              <Button asChild>
                <Link href='/builder'>
                  <Plus className='mr-2 size-4' />
                  {t('home.createButton')}
                </Link>
              </Button>

              <Button asChild variant='outline' onClick={handleImport}>
                <div>
                  <Import className='mr-2 size-4' />
                  {t('home.importButton')}
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex flex-col items-center justify-between gap-2 md:flex-row'>
              <h2 className='text-2xl font-semibold'>{t('home.myResumes')}</h2>
              <div className='flex flex-col items-center gap-2 md:flex-row'>
                <Button asChild>
                  <Link href='/builder'>
                    <Plus className='mr-2 size-4' />
                    {t('home.createButton')}
                  </Link>
                </Button>

                <Button asChild variant='outline' onClick={handleImport}>
                  <div>
                    <Import className='mr-2 size-4' />
                    {t('home.importButton')}
                  </div>
                </Button>
              </div>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {resumes.map((resume) => (
                <Card key={resume.id} className='overflow-hidden'>
                  <CardHeader>
                    <div className='flex justify-between'>
                      <CardTitle className='text-lg'>{resume.name}</CardTitle>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePreview(resume)}
                      >
                        <Eye className='mr-2 size-4' />
                        {t('common.preview')}
                      </Button>
                    </div>
                    <CardDescription>
                      {resume.data.personalInfo.name || 'No name'}
                      {resume.data.personalInfo.jobTitle && (
                        <span className='block text-sm text-muted-foreground'>
                          {resume.data.personalInfo.jobTitle}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEdit(resume.id)}
                    >
                      <Edit className='size-4' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDelete(resume.id)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-destructive text-destructive-foreground'
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewResume}
        onOpenChange={(open) => !open && setPreviewResume(null)}
      >
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-auto'>
          <DialogHeader>
            <DialogTitle>{previewResume?.name}</DialogTitle>
            <DialogDescription>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => handleExport(previewResume)}
              >
                <Download className='size-4' />
                {t('builder.export')}
              </Button>
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-md border bg-white text-black'>
            {previewResume && (
              <div id='resume-preview-export'>
                <ResumePreview
                  data={previewResume.data}
                  template={
                    previewResume.template as
                      | 'classic'
                      | 'modern'
                      | 'professional'
                      | 'compact'
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {exportResume && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>
                Export {exportResume.name}
              </h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setExportResume(null)}
              >
                ×
              </Button>
            </div>

            <div className='mb-6'>
              <div
                id={`export-content-${exportResume.id}`}
                className='rounded-lg border bg-white p-4'
              >
                <ResumePreview
                  data={exportResume.data}
                  template={
                    exportResume.template as
                      | 'classic'
                      | 'modern'
                      | 'professional'
                      | 'compact'
                  }
                />
              </div>
            </div>

            <ExportDialog
              open={!!exportResume}
              onOpenChangeAction={(open) => !open && setExportResume(null)}
              resumeData={exportResume.data}
              template={
                exportResume.template as
                  | 'classic'
                  | 'modern'
                  | 'professional'
                  | 'compact'
              }
              resumeName={exportResume.name}
            />
          </div>
        </div>
      )}
    </>
  );
}
