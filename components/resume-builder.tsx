'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PersonalInfoForm } from '@/components/form/personal-info-form';
import { EducationForm } from '@/components/form/education-form';
import { ExperienceForm } from '@/components/form/experience-form';
import { SkillsForm } from '@/components/form/skills-form';
import { ResumePreview } from '@/components/resume-preview';
import { TemplateSelector } from '@/components/template-selector';
import { ExportDialog } from '@/components/export/export-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Resume } from './home-content';

export type SocialLink = {
  platform: string;
  url: string;
  username: string;
};

export type ResumeData = {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    photo: string;
    jobTitle: string;
    socialLinks: SocialLink[];
  };
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string;
    techStack: string;
  }[];
  skills: string[];
};

const initialResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    photo: '',
    jobTitle: '',
    socialLinks: [],
  },
  education: [
    {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  experience: [
    {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: '',
      techStack: '',
    },
  ],
  skills: [],
};

export function ResumeBuilder() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('personal');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    'classic' | 'modern' | 'professional' | 'compact'
  >('classic');
  // const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Load resume data on mount or when resumeId changes
  useEffect(() => {
    if (resumeId) {
      try {
        const savedResumes = localStorage.getItem('savedResumes');
        if (savedResumes) {
          const resumes = JSON.parse(savedResumes);
          const resume = resumes.find((r: Resume) => r.id === resumeId);
          if (resume) {
            setResumeData(resume.data);
            setResumeName(resume.name);
            setCurrentResumeId(resumeId);
            if (resume.template) {
              setSelectedTemplate(resume.template);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load resume:', error);
      }
    }
  }, [resumeId]);

  // Memoized update functions to prevent unnecessary re-renders
  const updatePersonalInfo = useCallback(
    (personalInfo: ResumeData['personalInfo']) => {
      setResumeData((prev) => ({ ...prev, personalInfo }));
      setActiveTab('education');
    },
    [],
  );

  const updateEducation = useCallback((education: ResumeData['education']) => {
    setResumeData((prev) => ({ ...prev, education }));
    setActiveTab('experience');
  }, []);

  const updateExperience = useCallback(
    (experience: ResumeData['experience']) => {
      setResumeData((prev) => ({ ...prev, experience }));
      setActiveTab('skills');
    },
    [],
  );

  const updateSkills = useCallback((skills: ResumeData['skills']) => {
    setResumeData((prev) => ({ ...prev, skills }));
    setActiveTab('preview');
  }, []);

  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (currentResumeId) {
      // Update existing resume
      try {
        const savedResumes = localStorage.getItem('savedResumes');
        if (savedResumes) {
          const resumes = JSON.parse(savedResumes);
          const updatedResumes = resumes.map((r: Resume) => {
            if (r.id === currentResumeId) {
              return {
                ...r,
                data: resumeData,
                name: resumeName,
                template: selectedTemplate,
              };
            }
            return r;
          });
          localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
          toast.success(t('builder.resumeSaved'), {
            description: t('builder.resumeSavedDesc'),
          });
        }
      } catch (error) {
        console.error('Failed to save resume:', error);
      }
    } else {
      // Show save dialog for new resume
      setSaveDialogOpen(true);
    }
  }, [currentResumeId, resumeData, resumeName, selectedTemplate, t]);

  const handleSaveAs = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const saveNewResume = useCallback(() => {
    if (!resumeName.trim()) {
      return;
    }

    try {
      const newResumeId = Date.now().toString();
      const newResume = {
        id: newResumeId,
        name: resumeName,
        data: resumeData,
        template: selectedTemplate,
        createdAt: new Date().toISOString(),
      };

      const savedResumes = localStorage.getItem('savedResumes');
      let resumes = [];
      if (savedResumes) {
        resumes = JSON.parse(savedResumes);
      }
      resumes.push(newResume);
      localStorage.setItem('savedResumes', JSON.stringify(resumes));

      setCurrentResumeId(newResumeId);
      setSaveDialogOpen(false);
      toast.success(t('builder.resumeSaved'), {
        description: t('builder.resumeSavedDesc'),
      });

      // Redirect to the edit URL
      router.push(`/builder?id=${newResumeId}`);
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume', {
        description: 'Please try again.',
      });
    }
  }, [resumeName, resumeData, selectedTemplate, router, t]);

  // Memoized template change handler
  const handleTemplateChange = useCallback(
    (template: 'classic' | 'modern' | 'professional' | 'compact') => {
      setSelectedTemplate(template);
    },
    [],
  );

  // Memoized save button text
  const saveButtonText = useMemo(() => {
    return currentResumeId ? t('builder.save') : t('builder.save');
  }, [currentResumeId, t]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{t('builder.title')}</h1>
          <p className='text-muted-foreground'>{t('builder.subtitle')}</p>
        </div>
        <div className='flex gap-2'>
          {currentResumeId ? (
            <>
              <Button onClick={handleSave}>{saveButtonText}</Button>
              <Button variant='outline' onClick={handleSaveAs}>
                {t('builder.saveAs')}
              </Button>
            </>
          ) : (
            <Button onClick={handleSave}>{saveButtonText}</Button>
          )}
        </div>
      </div>

      <div className='space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-5 text-xs sm:text-sm'>
            <TabsTrigger value='personal' className='px-1 sm:px-3'>
              {t('builder.personal')}
            </TabsTrigger>
            <TabsTrigger value='education' className='px-1 sm:px-3'>
              {t('builder.education')}
            </TabsTrigger>
            <TabsTrigger value='experience' className='px-1 sm:px-3'>
              {t('builder.experience')}
            </TabsTrigger>
            <TabsTrigger value='skills' className='px-1 sm:px-3'>
              {t('builder.skills')}
            </TabsTrigger>
            <TabsTrigger value='preview' className='px-1 sm:px-3'>
              {t('builder.preview')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='personal' className='mt-6'>
            <PersonalInfoForm
              initialData={resumeData.personalInfo}
              onSave={updatePersonalInfo}
            />
          </TabsContent>
          <TabsContent value='education' className='mt-6'>
            <EducationForm
              initialData={resumeData.education}
              onSave={updateEducation}
            />
          </TabsContent>
          <TabsContent value='experience' className='mt-6'>
            <ExperienceForm
              initialData={resumeData.experience}
              onSave={updateExperience}
            />
          </TabsContent>
          <TabsContent value='skills' className='mt-6'>
            <SkillsForm initialData={resumeData.skills} onSave={updateSkills} />
          </TabsContent>
          <TabsContent value='preview' className='mt-6'>
            <div className='space-y-4'>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />

              <Card>
                <CardHeader>
                  <CardTitle>{t('builder.exportOptions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    <Button onClick={handleExport} variant='outline'>
                      {t('builder.export')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('builder.livePreview')}</CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='rounded-lg border bg-white px-10 py-14 text-black shadow-sm'>
            <ResumePreview data={resumeData} template={selectedTemplate} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('builder.saveAs')}</DialogTitle>
            <DialogDescription>{t('builder.resumeName')}</DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Label htmlFor='resume-name'>{t('builder.resumeName')}</Label>
            <Input
              id='resume-name'
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder='My Professional Resume'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setSaveDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveNewResume}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        resumeData={resumeData}
        template={selectedTemplate}
        resumeName={resumeName || 'My Resume'}
      />
    </div>
  );
}
