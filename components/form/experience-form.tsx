'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSchemaProvider,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '../resume-builder';
import { useTranslation } from '@/hooks/use-translation';

export interface ExperienceFormProps {
  initialData: ResumeData['experience'];
  onSave: (data: ResumeData['experience']) => void;
}

export function ExperienceForm({ initialData, onSave }: ExperienceFormProps) {
  const { t } = useTranslation();

  const experienceItemSchema = z.object({
    company: z.string().min(1, t('experience.companyRequired')),
    position: z.string().min(1, t('experience.positionRequired')),
    location: z.string().optional(),
    startDate: z.string().min(1, t('experience.startDateRequired')),
    endDate: z.string(),
    current: z.boolean().optional(),
    description: z.string().min(1, t('experience.descriptionRequired')),
    achievements: z.string().optional(),
    techStack: z.string().optional(),
  });

  const formSchema = z.object({
    experience: z.array(experienceItemSchema).min(1, t('experience.minOneEntry')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: initialData.length
        ? initialData
        : [
            {
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: '',
              achievements: '',
              techStack: '',
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values.experience);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('experience.title')}</CardTitle>
        <CardDescription>{t('experience.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormSchemaProvider schema={formSchema}>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {fields.map((field, index) => (
                <div key={field.id} className='relative space-y-4 rounded-md border p-4'>
                  {index > 0 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='size-4' />
                      <span className='sr-only'>{t('experience.removeExperience')}</span>
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name={`experience.${index}.company`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('experience.company')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('experience.companyPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.position`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('experience.position')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('experience.positionPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('experience.location')} ({t('common.optional')})
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t('experience.locationPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name={`experience.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('experience.startDate')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('experience.startDatePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('experience.endDate')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('experience.endDatePlaceholder')}
                              {...field}
                              disabled={form.watch(`experience.${index}.current`)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experience.${index}.current`}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue(`experience.${index}.endDate`, 'Present');
                              } else {
                                form.setValue(`experience.${index}.endDate`, '');
                              }
                            }}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>{t('experience.current')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('experience.description')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('experience.descriptionPlaceholder')}
                            className='min-h-[100px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.achievements`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('experience.achievements')} ({t('common.optional')})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('experience.achievementsPlaceholder')}
                            className='min-h-[80px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.techStack`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('experience.techStack')} ({t('common.optional')})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('experience.techStackPlaceholder')}
                            className='min-h-[60px]'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() =>
                  append({
                    company: '',
                    position: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                    achievements: '',
                    techStack: '',
                  })
                }
              >
                <Plus className='mr-2 size-4' />
                {t('experience.addExperience')}
              </Button>

              <Button type='submit' className='w-full'>
                {t('common.continue')}
              </Button>
            </form>
          </FormProvider>
        </FormSchemaProvider>
      </CardContent>
    </Card>
  );
}
