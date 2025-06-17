'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DEFAULT_TEXTAREA_ROWS, type ResumeData } from '../resume-builder';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useCallback, memo, useRef } from 'react';
import { Upload, Plus, Trash2, Globe, Linkedin, X } from 'lucide-react';
import { SiGithub, SiTelegram, SiX } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import { FormSchemaProvider } from '@/components/ui/form';

export interface PersonalInfoFormProps {
  initialData: ResumeData['personalInfo'];
  onSave: (data: ResumeData['personalInfo']) => void;
}

const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: SiGithub },
  { value: 'telegram', label: 'Telegram', icon: SiTelegram },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter', icon: SiX },
  { value: 'website', label: 'Website', icon: Globe },
] as const;

export const PersonalInfoForm = memo(function PersonalInfoForm({
  initialData,
  onSave,
}: PersonalInfoFormProps) {
  const { t } = useTranslation();
  const [photoPreview, setPhotoPreview] = useState<string>(initialData.photo || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formSchema = z.object({
    name: z.string().min(1, t('personalInfo.nameRequired')),
    email: z.string().email(t('personalInfo.emailInvalid')),
    phone: z.string().min(1, t('personalInfo.phoneRequired')),
    address: z.string().optional(),
    summary: z.string().optional(),
    photo: z.string().optional(),
    jobTitle: z.string(),
    socialLinks: z.array(
      z.object({
        platform: z.string().min(1, 'Platform is required'),
        url: z.string().optional(),
        username: z.string().min(1, 'Username is required'),
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      socialLinks: initialData.socialLinks || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotoPreview(result);
          form.setValue('photo', result);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      }
    },
    [form],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotoPreview(result);
          form.setValue('photo', result);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      }
    },
    [form],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removePhoto = useCallback(() => {
    setPhotoPreview('');
    form.setValue('photo', '');
  }, [form]);

  const addSocialLink = useCallback(() => {
    append({
      platform: '',
      url: '',
      username: '',
    });
  }, [append]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('personalInfo.title')}</CardTitle>
        <CardDescription>{t('personalInfo.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormSchemaProvider schema={formSchema}>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {/* Photo Upload */}
              <FormField
                control={form.control}
                name='photo'
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {t('personalInfo.photo')} ({t('common.optional')})
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        <div
                          className={`group relative ${photoPreview ? 'aspect-square w-full max-w-60' : 'h-60'}`}
                        >
                          {photoPreview ? (
                            <div className='relative h-full w-full'>
                              {isLoading ? (
                                <div className='bg-muted/50 flex h-full w-full items-center justify-center rounded-lg border'>
                                  <div className='border-primary size-6 animate-spin rounded-full border-2 border-t-transparent' />
                                </div>
                              ) : (
                                <Image
                                  src={photoPreview || '/placeholder.svg'}
                                  alt='Profile'
                                  fill
                                  className='size-auto rounded-lg border object-cover'
                                />
                              )}
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute -top-2 -right-2 size-6'
                                onClick={removePhoto}
                              >
                                <X className='size-4' />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className='border-muted-foreground/25 hover:border-primary/50 flex h-full items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors'
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <div className='flex flex-col items-center gap-4'>
                                <div className='bg-primary/10 rounded-full p-3'>
                                  <Upload className='text-primary size-8' />
                                </div>
                                <div className='space-y-2'>
                                  <p className='text-sm font-medium'>
                                    {t('personalInfo.dragAndDrop')}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {t('personalInfo.photoRequirements')}
                                  </p>
                                </div>
                                <Button
                                  type='button'
                                  variant='secondary'
                                  size='sm'
                                  onClick={triggerFileInput}
                                  className='hover:bg-secondary/80 mt-2 cursor-pointer transition-colors'
                                >
                                  {t('personalInfo.selectPhoto')}
                                </Button>
                              </div>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handlePhotoUpload}
                            className='hidden'
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalInfo.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personalInfo.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='jobTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalInfo.jobTitle')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personalInfo.jobTitlePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalInfo.email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personalInfo.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personalInfo.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personalInfo.phonePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('personalInfo.address')} ({t('common.optional')})
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('personalInfo.addressPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Links */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    {t('personalInfo.socialLinks')} ({t('common.optional')})
                  </Label>
                  <Button type='button' variant='outline' size='sm' onClick={addSocialLink}>
                    <Plus className='mr-2 size-4' />
                    {t('personalInfo.addSocialLink')}
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className='flex items-start gap-2 rounded-md border p-3'>
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>{t('personalInfo.platform')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('personalInfo.selectPlatform')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  <div className='flex items-center gap-2'>
                                    {platform.icon && <platform.icon className='size-4' />}
                                    {platform.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.username`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel className='text-xs'>{t('personalInfo.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('personalInfo.usernamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => remove(index)}
                      className='mt-6'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name='summary'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('personalInfo.summary')} ({t('common.optional')})
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('personalInfo.summaryPlaceholder')}
                        rows={DEFAULT_TEXTAREA_ROWS}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full'>
                {t('common.continue')}
              </Button>
            </form>
          </FormProvider>
        </FormSchemaProvider>
      </CardContent>
    </Card>
  );
});
