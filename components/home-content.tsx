'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Edit, Trash2, Import, Download, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ResumePreview } from '@/components/resume-preview';
import { ExportDialog } from '@/components/export/export-dialog';
import type { ResumeData } from '@/components/resume-builder';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [exportResume, setExportResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedResumeId, setExpandedResumeId] = useState<string | null>(null);

  useEffect(() => {
    const loadResumes = () => {
      try {
        const savedResumes = localStorage.getItem('savedResumes');
        if (savedResumes) {
          setResumes(JSON.parse(savedResumes));
        }
      } catch (error) {
        console.error('Failed to load resumes:', error);
        toast.error(t('common.errorLoadingResumes'));
      } finally {
        setIsLoading(false);
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

            if (!resumeData || typeof resumeData !== 'object' || !resumeData.personalInfo) {
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
      {isLoading ? (
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
        </div>
      ) : resumes.length === 0 ? (
        <div className='bg-muted/30 hover:bg-muted/40 rounded-lg border py-12 text-center transition-colors'>
          <h2 className='mb-2 text-lg font-medium'>{t('home.createResume')}</h2>
          <p className='text-muted-foreground mb-4'>{t('home.createResumeDesc')}</p>

          <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
            <Button asChild>
              <Link href='/builder'>
                <Plus className='mr-2 size-4' />
                <span>{t('home.createButton')}</span>
              </Link>
            </Button>

            <Button asChild variant='outline' onClick={handleImport}>
              <div>
                <Import className='mr-2 size-4' />
                <span>{t('home.importButton')}</span>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          <div className='flex flex-col items-center justify-between gap-2 md:flex-row'>
            <h2 className='hidden text-2xl font-semibold tracking-tight md:block'>
              {t('home.myResumes')}
            </h2>
            <div className='flex w-full items-center justify-end gap-2 md:w-auto'>
              <Button asChild>
                <Link href='/builder'>
                  <Plus className='size-4' />
                  <span className='hidden md:inline-flex'>{t('home.createButton')}</span>
                </Link>
              </Button>

              <Button asChild variant='outline' onClick={handleImport}>
                <div className='flex gap-2'>
                  <Import className='size-4' />
                  <span className='hidden md:inline-flex'>{t('home.importButton')}</span>
                </div>
              </Button>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className='group overflow-hidden transition-all hover:shadow-md'
              >
                <CardHeader>
                  <div className='flex justify-between'>
                    <CardTitle className='text-lg'>{resume.name}</CardTitle>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(resume.id);
                        }}
                      >
                        <Edit className='size-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(resume.id);
                        }}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {resume.data.personalInfo.name || 'No name'}
                    {resume.data.personalInfo.jobTitle && (
                      <span className='text-muted-foreground block text-sm'>
                        {resume.data.personalInfo.jobTitle}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <div className='p-4 pt-0'>
                  <Collapsible
                    open={expandedResumeId === resume.id}
                    onOpenChange={(open) => setExpandedResumeId(open ? resume.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant='outline' className='w-full justify-between'>
                        <span>{t('home.preview')}</span>
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            expandedResumeId === resume.id ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='mt-4 space-y-4'>
                      <div className='relative rounded-lg border bg-white p-4 text-black'>
                        <ResumePreview
                          data={resume.data}
                          template={
                            resume.template as 'classic' | 'modern' | 'professional' | 'compact'
                          }
                          scale={0.8}
                        />
                      </div>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='w-full'
                        onClick={() => setExportResume(resume)}
                      >
                        <Download className='mr-2 size-4' />
                        {t('builder.export')}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('profile.confirmDeleteDesc')}</AlertDialogDescription>
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

      {exportResume && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Export {exportResume.name}</h2>
              <Button variant='ghost' size='sm' onClick={() => setExportResume(null)}>
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
                    exportResume.template as 'classic' | 'modern' | 'professional' | 'compact'
                  }
                />
              </div>
            </div>

            <ExportDialog
              open={!!exportResume}
              onOpenChangeAction={(open) => !open && setExportResume(null)}
              resumeData={exportResume.data}
              template={exportResume.template as 'classic' | 'modern' | 'professional' | 'compact'}
              resumeName={exportResume.name}
            />
          </div>
        </div>
      )}
    </>
  );
}
