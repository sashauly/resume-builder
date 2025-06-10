'use client';

import { ResumeBuilder } from '@/components/resume-builder';
import { useTranslation } from '@/hooks/use-translation';
import { Suspense } from 'react';

export default function BuilderPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className='flex size-full items-center justify-center'>
          {t('common.loading')}
        </div>
      }
    >
      <ResumeBuilder />
    </Suspense>
  );
}
