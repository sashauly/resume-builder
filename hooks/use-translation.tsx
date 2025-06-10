'use client';

import { useLocale } from '@/hooks/use-locale';
import {
  translations,
  Translations,
  TranslationValue,
} from '@/lib/translations';

export function useTranslation() {
  const { locale } = useLocale();

  const t = (key: string): string => {
    const keys = key.split('.');
    let currentTranslation: Translations[keyof Translations] | string =
      translations[locale];

    for (const k of keys) {
      if (
        typeof currentTranslation === 'object' &&
        currentTranslation !== null
      ) {
        if (!(k in currentTranslation)) {
          return key;
        }
        currentTranslation = (
          currentTranslation as { [key: string]: TranslationValue }
        )[k];
      } else {
        return key;
      }
    }

    if (typeof currentTranslation === 'string') {
      return currentTranslation;
    } else {
      return key;
    }
  };

  return { t };
}
