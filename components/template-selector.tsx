'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

export interface TemplateSelectorProps {
  selectedTemplate: 'classic' | 'modern' | 'professional' | 'compact';
  onTemplateChange: (
    template: 'classic' | 'modern' | 'professional' | 'compact',
  ) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('builder.selectTemplate')}</CardTitle>
        <CardDescription>{t('templates.selectTemplate')}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedTemplate}
          onValueChange={(value) =>
            onTemplateChange(
              value as 'classic' | 'modern' | 'professional' | 'compact',
            )
          }
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-center space-x-2 rounded-lg border p-4'>
              <RadioGroupItem value='classic' id='template-classic' />
              <Label htmlFor='template-classic' className='flex-1'>
                <div>
                  <h3 className='font-medium'>{t('templates.classic')}</h3>
                  <p className='text-sm text-muted-foreground'>
                    Traditional layout with sidebar
                  </p>
                </div>
              </Label>
            </div>
            <div className='flex items-center space-x-2 rounded-lg border p-4'>
              <RadioGroupItem value='modern' id='template-modern' />
              <Label htmlFor='template-modern' className='flex-1'>
                <div>
                  <h3 className='font-medium'>{t('templates.modern')}</h3>
                  <p className='text-sm text-muted-foreground'>
                    Clean and minimalist design
                  </p>
                </div>
              </Label>
            </div>
            <div className='flex items-center space-x-2 rounded-lg border p-4'>
              <RadioGroupItem value='professional' id='template-professional' />
              <Label htmlFor='template-professional' className='flex-1'>
                <div>
                  <h3 className='font-medium'>{t('templates.professional')}</h3>
                  <p className='text-sm text-muted-foreground'>
                    Corporate-style layout
                  </p>
                </div>
              </Label>
            </div>
            <div className='flex items-center space-x-2 rounded-lg border p-4'>
              <RadioGroupItem value='compact' id='template-compact' />
              <Label htmlFor='template-compact' className='flex-1'>
                <div>
                  <h3 className='font-medium'>{t('templates.compact')}</h3>
                  <p className='text-sm text-muted-foreground'>
                    Detailed layout with photo
                  </p>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
