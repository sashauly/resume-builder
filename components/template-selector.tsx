'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

export interface TemplateSelectorProps {
  selectedTemplate: 'classic' | 'modern' | 'professional' | 'compact';
  onTemplateChangeAction: (template: 'classic' | 'modern' | 'professional' | 'compact') => void;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChangeAction,
}: TemplateSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className='p-4'>
          <CollapsibleTrigger asChild>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base'>{t('builder.selectTemplate')}</CardTitle>
                <CardDescription className='text-sm'>
                  {t(`templates.${selectedTemplate}`)}
                </CardDescription>
              </div>
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='p-4 pt-0'>
            <RadioGroup
              value={selectedTemplate}
              onValueChange={(value) =>
                onTemplateChangeAction(value as 'classic' | 'modern' | 'professional' | 'compact')
              }
            >
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* <div className='flex items-center space-x-2 rounded-lg border p-4'>
                  <RadioGroupItem value='classic' id='template-classic' disabled />
                  <Label htmlFor='template-classic' className='flex-1'>
                    <div>
                      <h3 className='font-medium'>{t('templates.classic')}</h3>
                      <p className='text-muted-foreground text-sm'>
                        {t('templates.classicDescription')}
                      </p>
                    </div>
                  </Label>
                </div>
                <div className='flex items-center space-x-2 rounded-lg border p-4'>
                  <RadioGroupItem value='modern' id='template-modern' disabled />
                  <Label htmlFor='template-modern' className='flex-1'>
                    <div>
                      <h3 className='font-medium'>{t('templates.modern')}</h3>
                      <p className='text-muted-foreground text-sm'>
                        {t('templates.modernDescription')}
                      </p>
                    </div>
                  </Label>
                </div>
                <div className='flex items-center space-x-2 rounded-lg border p-4'>
                  <RadioGroupItem value='professional' id='template-professional' disabled />
                  <Label htmlFor='template-professional' className='flex-1'>
                    <div>
                      <h3 className='font-medium'>{t('templates.professional')}</h3>
                      <p className='text-muted-foreground text-sm'>
                        {t('templates.professionalDescription')}
                      </p>
                    </div>
                  </Label>
                </div> */}
                <div className='flex items-center space-x-2 rounded-lg border p-4'>
                  <RadioGroupItem value='compact' id='template-compact' />
                  <Label htmlFor='template-compact' className='flex-1'>
                    <div>
                      <h3 className='font-medium'>{t('templates.compact')}</h3>
                      <p className='text-muted-foreground text-sm'>
                        {t('templates.compactDescription')}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
