'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LocaleToggle } from '@/components/locale/locale-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { FileText } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useMobile();

  if (isMobile) {
    return null;
  }

  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:max-w-7xl'>
        <div className='flex items-center gap-6'>
          <Link
            href='/'
            className='hover:text-primary flex items-center gap-2 font-bold transition-colors'
            aria-label={t('app.name')}
          >
            <FileText className='size-5' />
            <span>{t('app.name')}</span>
          </Link>
          <nav className='hidden gap-6 md:flex' role='navigation' aria-label='Main navigation'>
            <Link
              href='/'
              className={cn(
                'hover:text-primary text-sm font-medium transition-colors',
                pathname === '/' ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              {t('nav.home')}
            </Link>
            <Link
              href='/builder'
              className={cn(
                'hover:text-primary text-sm font-medium transition-colors',
                pathname === '/builder' ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-current={pathname === '/builder' ? 'page' : undefined}
            >
              {t('nav.builder')}
            </Link>
            <Link
              href='/settings'
              className={cn(
                'hover:text-primary text-sm font-medium transition-colors',
                pathname === '/settings' ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-current={pathname === '/settings' ? 'page' : undefined}
            >
              {t('nav.settings')}
            </Link>
          </nav>
        </div>
        <div className='flex items-center gap-2'>
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
