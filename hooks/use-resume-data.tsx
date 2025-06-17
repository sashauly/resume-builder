import { useState, useEffect, useCallback } from 'react';
import { ResumeData } from '@/components/resume-builder';
import { Resume } from '@/components/home-content';

export const initialResumeData: ResumeData = {
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

export function useResumeData(resumeId: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [resumeName, setResumeName] = useState('');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    'classic' | 'modern' | 'professional' | 'compact'
  >('classic');

  const updateResumeData = useCallback((data: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(data);
  }, []);

  const updateResumeName = useCallback((name: string) => {
    setResumeName(name);
  }, []);

  const updateCurrentResumeId = useCallback((id: string | null) => {
    setCurrentResumeId(id);
  }, []);

  const updateSelectedTemplate = useCallback(
    (template: 'classic' | 'modern' | 'professional' | 'compact') => {
      setSelectedTemplate(template);
    },
    [],
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
    setIsLoading(false);
  }, [resumeId]);

  return {
    isLoading,
    resumeData,
    setResumeData: updateResumeData,
    resumeName,
    setResumeName: updateResumeName,
    currentResumeId,
    setCurrentResumeId: updateCurrentResumeId,
    selectedTemplate,
    setSelectedTemplate: updateSelectedTemplate,
  };
}
