'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useMobile } from '@/hooks/use-mobile';

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 border-t bg-background'>
      <div className='grid h-16 grid-cols-3'>
        <Link
          href='/'
          className={`flex flex-col items-center justify-center ${
            pathname === '/' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className='size-5' />
          <span className='mt-1 text-xs'>{t('nav.home')}</span>
        </Link>
        <Link
          href='/builder'
          className={`flex flex-col items-center justify-center ${
            pathname === '/builder' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <FileText className='size-5' />
          <span className='mt-1 text-xs'>{t('nav.builder')}</span>
        </Link>
        <Link
          href='/settings'
          className={`flex flex-col items-center justify-center ${
            pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Settings className='size-5' />
          <span className='mt-1 text-xs'>{t('nav.settings')}</span>
        </Link>
      </div>
    </div>
  );
}
