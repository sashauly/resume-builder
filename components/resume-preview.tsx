'use client';

import type { ResumeData } from './resume-builder';
import { ClassicTemplate } from './templates/classic-template';
import { ModernTemplate } from './templates/modern-template';
import { ProfessionalTemplate } from './templates/professional-template';
import { CompactTemplate } from './templates/compact-template';
import { useRef, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface ResumePreviewProps {
  data: ResumeData;
  template?: 'classic' | 'modern' | 'professional' | 'compact';
  scale?: number;
}

export function ResumePreview({
  data,
  template = 'compact',
  scale: initialScale = 1,
}: ResumePreviewProps) {
  const { t } = useTranslation();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const { personalInfo, education, experience, skills } = data;

  const hasPersonalInfo = personalInfo.name || personalInfo.email || personalInfo.phone;
  const hasEducation = education.some((edu) => edu.institution || edu.degree);
  const hasExperience = experience.some((exp) => exp.company || exp.position);
  const hasSkills = skills.length > 0;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  if (!hasPersonalInfo && !hasEducation && !hasExperience && !hasSkills) {
    return (
      <div className='text-muted-foreground py-10 text-center'>
        <p>{t('previewEmpty')}</p>
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
    <>
      <div className='absolute top-4 right-4 z-10 flex gap-2' onClick={(e) => e.stopPropagation()}>
        <Button variant='outline' size='icon' onClick={handleZoomOut} title={t('preview.zoomOut')}>
          <ZoomOut className='h-4 w-4' />
        </Button>
        <Button variant='outline' size='icon' onClick={handleReset} title={t('preview.resetZoom')}>
          <RotateCcw className='h-4 w-4' />
        </Button>
        <Button variant='outline' size='icon' onClick={handleZoomIn} title={t('preview.zoomIn')}>
          <ZoomIn className='h-4 w-4' />
        </Button>
      </div>

      <div
        className='relative mx-auto w-full overflow-auto bg-white shadow-lg'
        style={{
          width: `${210 * scale}mm`,
          minHeight: `${297 * scale}mm`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontSize: `${scale}rem`,
        }}
      >
        <div
          id='resume-preview-export'
          ref={resumeRef}
          style={{
            padding: `${20 * scale}mm`,
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </>
  );
}
