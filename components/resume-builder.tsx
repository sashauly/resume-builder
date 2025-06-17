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
import exportResume, { ExportData } from '@/lib/export';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import FormatSelector from './format-selector';
import { Resume } from './home-content';
import { v4 as uuidv4 } from 'uuid';
import { useResumeData } from '@/hooks/use-resume-data';
import { ChevronLeft, ChevronRight, Save, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

export type SocialLink = {
  platform: string;
  url?: string;
  username: string;
};

export type ResumeData = {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    summary?: string;
    photo?: string;
    jobTitle: string;
    socialLinks: SocialLink[];
  };
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  experience: {
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    description: string;
    achievements?: string;
    techStack?: string;
  }[];
  skills: string[];
};

const TABS = ['personal', 'education', 'experience', 'skills', 'preview'] as const;

export function ResumeBuilder() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('personal');
  const {
    isLoading,
    resumeData,
    setResumeData,
    resumeName,
    setResumeName,
    currentResumeId,
    setCurrentResumeId,
    selectedTemplate,
    setSelectedTemplate,
  } = useResumeData(resumeId);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportData['exportFormat']>('html');

  const currentTabIndex = TABS.indexOf(activeTab as (typeof TABS)[number]);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  const handlePreviousTab = () => {
    if (!isFirstTab) {
      const previousTab = TABS[currentTabIndex - 1];
      setActiveTab(previousTab);
      window.location.hash = previousTab;
    }
  };

  const handleNextTab = () => {
    if (!isLastTab) {
      const nextTab = TABS[currentTabIndex + 1];
      setActiveTab(nextTab);
      window.location.hash = nextTab;
    }
  };

  // Add effect to handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (['personal', 'education', 'experience', 'skills', 'preview'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Set initial tab from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  const updatePersonalInfo = useCallback(
    (personalInfo: ResumeData['personalInfo']) => {
      setResumeData({ ...resumeData, personalInfo });
      setActiveTab('education');
    },
    [resumeData, setResumeData],
  );

  const updateEducation = useCallback(
    (education: ResumeData['education']) => {
      setResumeData({ ...resumeData, education });
      setActiveTab('experience');
    },
    [resumeData, setResumeData],
  );

  const updateExperience = useCallback(
    (experience: ResumeData['experience']) => {
      setResumeData({ ...resumeData, experience });
      setActiveTab('skills');
    },
    [resumeData, setResumeData],
  );

  const updateSkills = useCallback(
    (skills: ResumeData['skills']) => {
      setResumeData({ ...resumeData, skills });
      setActiveTab('preview');
    },
    [resumeData, setResumeData],
  );

  const handleExport = useCallback(async () => {
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
  }, [exportFormat, resumeName, locale, resumeData, t]);

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
  }, [resumeName, resumeData, selectedTemplate, router, t, setCurrentResumeId]);

  const handleTemplateChange = useCallback(
    (template: 'classic' | 'modern' | 'professional' | 'compact') => {
      setSelectedTemplate(template);
    },
    [setSelectedTemplate],
  );

  const saveButtonText = useMemo(() => {
    return currentResumeId ? t('builder.save') : t('builder.save');
  }, [currentResumeId, t]);

  const progress = useMemo(() => {
    return ((currentTabIndex + 1) / TABS.length) * 100;
  }, [currentTabIndex]);

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    );
  }

  return (
    <>
      <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 backdrop-blur'>
        <Progress value={progress} className='h-1' />
      </div>

      <div className='md:space-y-6'>
        <div className='flex flex-col items-center justify-between gap-2 md:flex-row'>
          <div className='hidden md:block'>
            <h1 className='text-3xl font-bold tracking-tight'>{t('builder.title')}</h1>
            <p className='text-muted-foreground'>{t('builder.subtitle')}</p>
          </div>
          <div className='hidden gap-2 md:flex'>
            <Button onClick={handleSave} className='flex gap-2' title={t('common.save')}>
              <Save className='size-4' />
              <span>{saveButtonText}</span>
            </Button>
            {currentResumeId && (
              <Button
                variant='outline'
                onClick={handleSaveAs}
                className='flex gap-2'
                title={t('builder.saveAs')}
              >
                <Save className='size-4' />
                <span>{t('builder.saveAs')}</span>
              </Button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 pb-18 md:grid-cols-2'>
          <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
            <TabsList className='hidden h-fit w-full grid-cols-2 gap-2 md:grid md:flex-row md:gap-0 lg:flex'>
              <TabsTrigger value='personal'>{t('builder.personal')}</TabsTrigger>
              <TabsTrigger value='education'>{t('builder.education')}</TabsTrigger>
              <TabsTrigger value='experience'>{t('builder.experience')}</TabsTrigger>
              <TabsTrigger value='skills'>{t('builder.skills')}</TabsTrigger>
              <TabsTrigger value='preview'>{t('builder.preview')}</TabsTrigger>
            </TabsList>
            <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed right-0 bottom-16 left-0 z-40 flex flex-col border p-4 backdrop-blur md:hidden'>
              <div className='flex items-center justify-between gap-2'>
                <Button variant='outline' onClick={handlePreviousTab} disabled={isFirstTab}>
                  <ChevronLeft className='size-4' />
                  <span className='hidden sm:inline-flex'>{t('common.previous')}</span>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2'>
                      <span className='text-md font-medium'>{t(`builder.${activeTab}`)}</span>
                      <ChevronDown className='size-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-56 p-2'>
                    <div className='flex flex-col gap-1'>
                      {TABS.map((tab) => (
                        <Button
                          key={tab}
                          variant={activeTab === tab ? 'default' : 'ghost'}
                          className='justify-start'
                          onClick={() => handleTabChange(tab)}
                        >
                          {t(`builder.${tab}`)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className='flex gap-2'>
                  <Button onClick={handleSave} size='icon' title={t('common.save')}>
                    <Save className='size-4' />
                  </Button>
                  {currentResumeId && (
                    <Button
                      variant='outline'
                      onClick={handleSaveAs}
                      size='icon'
                      title={t('builder.saveAs')}
                    >
                      <Save className='size-4' />
                    </Button>
                  )}
                </div>
                <Button variant='outline' onClick={handleNextTab} disabled={isLastTab}>
                  <span className='hidden sm:inline-flex'>{t('common.next')}</span>
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>
            <TabsContent value='personal'>
              <PersonalInfoForm initialData={resumeData.personalInfo} onSave={updatePersonalInfo} />
            </TabsContent>
            <TabsContent value='education'>
              <EducationForm initialData={resumeData.education} onSave={updateEducation} />
            </TabsContent>
            <TabsContent value='experience'>
              <ExperienceForm initialData={resumeData.experience} onSave={updateExperience} />
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

          <Card className={`${activeTab !== 'preview' ? 'hidden md:block' : ''}`}>
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
    </>
  );
}
