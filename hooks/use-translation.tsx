// hooks/use-translation.ts
"use client";

import { useLocale } from "@/hooks/use-locale";
import {
  translations,
  Translations,
  TranslationValue,
} from "@/lib/translations"; // Import TranslationValue

export function useTranslation() {
  const { locale } = useLocale();

  const t = (key: string): string => {
    const keys = key.split(".");
    let currentTranslation: Translations[keyof Translations] | string =
      translations[locale];

    for (const k of keys) {
      if (
        typeof currentTranslation === "object" &&
        currentTranslation !== null
      ) {
        if (!(k in currentTranslation)) {
          // If the key is not found at this level, return the original key
          return key;
        }
        currentTranslation = (
          currentTranslation as { [key: string]: TranslationValue }
        )[k];
      } else {
        // If we've reached a string value before traversing all keys,
        // it means the key path is deeper than the actual translation.
        return key;
      }
    }

    // Ensure the final value is a string. If it's still an object, it means
    // the key path didn't lead to a final string translation.
    if (typeof currentTranslation === "string") {
      return currentTranslation;
    } else {
      // If the final value is an object (meaning the key path didn't lead to a string),
      // or if it's undefined (which shouldn't happen with the `k in currentTranslation` check),
      // return the original key.
      return key;
    }
  };

  return { t };
}
