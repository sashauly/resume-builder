'use client';

import { EducationForm } from '@/components/form/education-form';
import { ExperienceForm } from '@/components/form/experience-form';
import { PersonalInfoForm } from '@/components/form/personal-info-form';
import { SkillsForm } from '@/components/form/skills-form';
import { ResumePreview } from '@/components/resume-preview';
import { TemplateSelector } from '@/components/template-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import exportResume from '@/lib/export';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import FormatSelector from './format-selector';
import { Resume } from './home-content';
import { v4 as uuidv4 } from 'uuid';

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
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('personal');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    'classic' | 'modern' | 'professional' | 'compact'
  >('classic');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'image' | 'word' | 'html'>(
    'html',
  );

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

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await exportResume({ exportFormat, resumeName, locale, resumeData });

      toast.success(t('export.success'), {
        description: `${resumeName || 'Resume'}.${exportFormat}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = useCallback(() => {
    if (currentResumeId) {
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
                updatedAt: new Date().toISOString(),
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
      const newResumeId = uuidv4();
      const newResume = {
        id: newResumeId,
        name: resumeName,
        data: resumeData,
        template: selectedTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

      router.push(`/builder?id=${newResumeId}`);
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume', {
        description: 'Please try again.',
      });
    }
  }, [resumeName, resumeData, selectedTemplate, router, t]);

  const handleTemplateChange = useCallback(
    (template: 'classic' | 'modern' | 'professional' | 'compact') => {
      setSelectedTemplate(template);
    },
    [],
  );

  const saveButtonText = useMemo(() => {
    return currentResumeId ? t('builder.save') : t('builder.save');
  }, [currentResumeId, t]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center justify-between gap-2 md:flex-row'>
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid h-fit grid-cols-2 gap-2 md:flex-row md:gap-0 lg:flex'>
            <TabsTrigger value='personal'>{t('builder.personal')}</TabsTrigger>
            <TabsTrigger value='education'>
              {t('builder.education')}
            </TabsTrigger>
            <TabsTrigger value='experience'>
              {t('builder.experience')}
            </TabsTrigger>
            <TabsTrigger value='skills'>{t('builder.skills')}</TabsTrigger>
            <TabsTrigger value='preview'>{t('builder.preview')}</TabsTrigger>
          </TabsList>
          <TabsContent value='personal'>
            <PersonalInfoForm
              initialData={resumeData.personalInfo}
              onSave={updatePersonalInfo}
            />
          </TabsContent>
          <TabsContent value='education'>
            <EducationForm
              initialData={resumeData.education}
              onSave={updateEducation}
            />
          </TabsContent>
          <TabsContent value='experience'>
            <ExperienceForm
              initialData={resumeData.experience}
              onSave={updateExperience}
            />
          </TabsContent>
          <TabsContent value='skills'>
            <SkillsForm initialData={resumeData.skills} onSave={updateSkills} />
          </TabsContent>
          <TabsContent value='preview'>
            <div className='space-y-4'>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChangeAction={handleTemplateChange}
              />

              <FormatSelector
                exportFormat={exportFormat}
                handleExport={handleExport}
                isExporting={isExporting}
                setExportFormat={setExportFormat}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>{t('builder.livePreview')}</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='rounded-lg border bg-white px-10 py-14 text-black shadow-xs'>
              <ResumePreview data={resumeData} template={selectedTemplate} />
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
