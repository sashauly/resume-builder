'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocale } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { Code, Download, File, FileImage } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';
import type { ResumeData } from '../resume-builder';
import exportResume from '@/lib/export';

interface ExportDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  resumeData: ResumeData;
  template: 'classic' | 'modern' | 'professional' | 'compact';
  resumeName: string;
}

export function ExportDialog({
  open,
  onOpenChangeAction,
  resumeData,
  template,
  resumeName,
}: ExportDialogProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [isExporting, setIsExporting] = useState(false);

  const [exportFormat, setExportFormat] = useState<'image' | 'word' | 'html'>(
    'html',
  );

  console.log(template);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await exportResume(exportFormat, resumeName, locale, resumeData);

      toast.success(t('export.success'), {
        description: `${resumeName || 'Resume'}.${exportFormat}`,
      });

      onOpenChangeAction(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChangeAction}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-auto'>
          <DialogHeader>
            <DialogTitle>{t('builder.exportAs')}</DialogTitle>
            <DialogDescription>
              {t('export.chooseFormat')}: {resumeName}
              <br />
              <span className='text-xs text-muted-foreground'>
                {t('export.multipageSupport')}
              </span>
            </DialogDescription>
          </DialogHeader>

          <ExportFormat
            defaultFormat={exportFormat}
            setDefaultFormat={setExportFormat}
          />

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => onOpenChangeAction(false)}
              disabled={isExporting}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Download className='mr-2 size-4 animate-spin' />
                  {t('export.downloading')}
                </>
              ) : (
                <>
                  <Download className='mr-2 size-4' />
                  {t('export.exportButton')} {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ExportFormat({
  defaultFormat = 'html',
  setDefaultFormat,
}: {
  defaultFormat?: 'image' | 'word' | 'html';
  setDefaultFormat?: Dispatch<SetStateAction<'image' | 'word' | 'html'>>;
}) {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<'image' | 'word' | 'html'>(
    defaultFormat,
  );

  return (
    <>
      <h3 className='mb-3 font-medium'>{t('export.exportFormat')}</h3>
      <RadioGroup
        value={exportFormat}
        onValueChange={(value) => {
          if (setDefaultFormat) {
            setDefaultFormat(value as 'image' | 'word' | 'html');
          }
          setExportFormat(value as 'image' | 'word' | 'html');
        }}
      >
        <div className='space-y-3'>
          <div className='flex items-center space-x-3 rounded-lg border p-3'>
            <RadioGroupItem value='html' id='export-html' />
            <Code className='size-5 text-purple-600' />
            <Label htmlFor='export-html' className='flex-1'>
              <div>
                <h3 className='font-medium'>{t('builder.exportHtml')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t('export.htmlDescription')}
                </p>
              </div>
            </Label>
          </div>

          <div className='flex items-center space-x-3 rounded-lg border p-3'>
            <RadioGroupItem value='image' id='export-image' />
            <FileImage className='size-5 text-blue-500' />
            <Label htmlFor='export-image' className='flex-1'>
              <div>
                <h3 className='font-medium'>{t('builder.exportImage')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t('export.imageDescription')}
                </p>
              </div>
            </Label>
          </div>

          <div className='flex items-center space-x-3 rounded-lg border p-3'>
            <RadioGroupItem value='word' id='export-word' />
            <File className='size-5 text-blue-600' />
            <Label htmlFor='export-word' className='flex-1'>
              <div>
                <h3 className='font-medium'>{t('builder.exportWord')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t('export.wordDescription')}
                </p>
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>
    </>
  );
}
