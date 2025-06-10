'use client';

import type { ResumeData } from './resume-builder';
import { ClassicTemplate } from './templates/classic-template';
import { ModernTemplate } from './templates/modern-template';
import { ProfessionalTemplate } from './templates/professional-template';
import { CompactTemplate } from './templates/compact-template';
import { useRef } from 'react';

export interface ResumePreviewProps {
  data: ResumeData;
  template?: 'classic' | 'modern' | 'professional' | 'compact';
}

export function ResumePreview({
  data,
  template = 'compact',
}: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { personalInfo, education, experience, skills } = data;

  const hasPersonalInfo =
    personalInfo.name || personalInfo.email || personalInfo.phone;
  const hasEducation = education.some((edu) => edu.institution || edu.degree);
  const hasExperience = experience.some((exp) => exp.company || exp.position);
  const hasSkills = skills.length > 0;

  if (!hasPersonalInfo && !hasEducation && !hasExperience && !hasSkills) {
    return (
      <div className='py-10 text-center text-muted-foreground'>
        <p>Start filling out the form to see your resume preview here.</p>
      </div>
    );
  }

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'professional':
        return <ProfessionalTemplate data={data} />;
      case 'compact':
        return <CompactTemplate data={data} />;
      case 'classic':
      default:
        return <ClassicTemplate data={data} />;
    }
  };

  return (
    <div id='resume-preview-export' ref={resumeRef}>
      {renderTemplate()}
    </div>
  );
}
