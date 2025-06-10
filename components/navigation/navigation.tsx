'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LocaleToggle } from '@/components/locale/locale-toggle';
import { useTranslation } from '@/hooks/use-translation';
import { FileText } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useMobile();

  // Hide on mobile as we'll use bottom navigation instead
  if (isMobile) {
    return null;
  }

  return (
    <header className='border-b'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center gap-2 font-bold'>
            <FileText className='size-5' />
            <span>{t('app.name')}</span>
          </Link>
          <nav className='hidden gap-6 md:flex'>
            <Link
              href='/'
              className={`text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              href='/builder'
              className={`text-sm font-medium transition-colors ${
                pathname === '/builder'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('nav.builder')}
            </Link>
            <Link
              href='/settings'
              className={`text-sm font-medium transition-colors ${
                pathname === '/settings'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
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
