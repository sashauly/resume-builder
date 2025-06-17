'use client';

import type React from 'react';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSchemaProvider,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { ResumeData } from '../resume-builder';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  skill: z.string().optional(),
});

export interface SkillsFormProps {
  initialData: ResumeData['skills'];
  onSave: (data: ResumeData['skills']) => void;
}

export function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<string[]>(initialData || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: '',
    },
  });

  function addSkill(skill: string) {
    const skillsToAdd = skill
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !skills.includes(s));

    if (skillsToAdd.length > 0) {
      setSkills([...skills, ...skillsToAdd]);
      form.reset();
    }
  }

  function removeSkill(skillToRemove: string) {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.skill) {
      addSkill(values.skill);
    } else {
      onSave(skills);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = form.getValues().skill;
      if (value) {
        addSkill(value);
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('skills.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormSchemaProvider schema={formSchema}>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='skill'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('skills.addSkills')}</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <div className='text-muted-foreground text-sm'>{t('skills.inputHelp')}</div>
                        <div className='flex space-x-2'>
                          <Input
                            placeholder={t('skills.skillPlaceholder')}
                            {...field}
                            onKeyDown={handleKeyDown}
                            aria-label={t('skills.inputAriaLabel')}
                            aria-describedby='skills-input-help'
                            id='skills-input'
                          />
                          <Button
                            type='button'
                            onClick={() => {
                              const value = form.getValues().skill;
                              if (value) {
                                addSkill(value);
                              }
                            }}
                            aria-label={t('skills.addButtonAriaLabel')}
                          >
                            {t('skills.addButton')}
                          </Button>
                        </div>
                        <p id='skills-input-help' className='text-muted-foreground text-sm'>
                          {t('skills.inputInstructions')}
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className='min-h-[100px] rounded-md border p-4'
                role='region'
                aria-label={t('skills.skillsListAriaLabel')}
              >
                <div className='mb-2 text-sm font-medium'>{t('skills.yourSkills')}</div>
                {skills.length === 0 ? (
                  <p className='text-muted-foreground text-sm'>{t('skills.noSkills')}</p>
                ) : (
                  <div className='flex flex-wrap gap-2' role='list'>
                    {skills.map((skill, index) => (
                      <Badge key={index} variant='secondary' className='px-2 py-1' role='listitem'>
                        {skill}
                        <button
                          type='button'
                          onClick={() => removeSkill(skill)}
                          className='hover:text-destructive ml-1'
                          aria-label={`${t('skills.removeSkillAriaLabel')} ${skill}`}
                        >
                          <X className='size-3' aria-hidden='true' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type='button'
                className='w-full'
                onClick={() => onSave(skills)}
                disabled={skills.length === 0}
              >
                {t('common.continue')}
              </Button>
            </form>
          </FormProvider>
        </FormSchemaProvider>
      </CardContent>
    </Card>
  );
}
