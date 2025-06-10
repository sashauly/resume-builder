'use client';

import { useTranslation } from '@/hooks/use-translation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { useLocale } from '@/hooks/use-locale';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function SettingsContent() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    toast.success(t('settings.saved'), {
      description: t('settings.savedDesc'),
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-3xl font-bold'>{t('settings.title')}</h1>
        <p className='text-muted-foreground'>{t('settings.subtitle')}</p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>
                  {t('settings.theme')}
                </h3>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value);
                    handleSave();
                  }}
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='system' id='theme-system' />
                    <Label htmlFor='theme-system'>{t('settings.system')}</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='light' id='theme-light' />
                    <Label htmlFor='theme-light'>{t('settings.light')}</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='dark' id='theme-dark' />
                    <Label htmlFor='theme-dark'>{t('settings.dark')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
            <CardDescription>{t('settings.languageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <RadioGroup
                value={locale}
                onValueChange={(value) => {
                  setLocale(value as 'en' | 'ru');
                  handleSave();
                }}
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='en' id='lang-en' />
                  <Label htmlFor='lang-en'>English</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='ru' id='lang-ru' />
                  <Label htmlFor='lang-ru'>Русский</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
