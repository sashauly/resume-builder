'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur'>
      <div className='grid h-16 grid-cols-3'>
        <Link
          href='/'
          className={cn(
            'flex flex-col items-center justify-center transition-colors',
            pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
          )}
          aria-current={pathname === '/' ? 'page' : undefined}
          aria-label={t('nav.home')}
        >
          <Home className='size-5' />
          <span className='mt-1 text-xs font-medium'>{t('nav.home')}</span>
        </Link>
        <Link
          href='/builder'
          className={cn(
            'flex flex-col items-center justify-center transition-colors',
            pathname === '/builder' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
          )}
          aria-current={pathname === '/builder' ? 'page' : undefined}
          aria-label={t('nav.builder')}
        >
          <FileText className='size-5' />
          <span className='mt-1 text-xs font-medium'>{t('nav.builder')}</span>
        </Link>
        <Link
          href='/settings'
          className={cn(
            'flex flex-col items-center justify-center transition-colors',
            pathname === '/settings' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
          )}
          aria-current={pathname === '/settings' ? 'page' : undefined}
          aria-label={t('nav.settings')}
        >
          <Settings className='size-5' />
          <span className='mt-1 text-xs font-medium'>{t('nav.settings')}</span>
        </Link>
      </div>
    </div>
  );
}
