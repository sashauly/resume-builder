import { useTranslation } from '@/hooks/use-translation';
import { Download, ChevronDown } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { ExportFormat } from './export/export-dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { ExportData } from '@/lib/export';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface FormatSelectorProps {
  exportFormat: ExportData['exportFormat'];
  handleExport: () => Promise<void>;
  isExporting: boolean;
  setExportFormat: Dispatch<SetStateAction<ExportData['exportFormat']>>;
}

export default function FormatSelector({
  exportFormat,
  handleExport,
  isExporting,
  setExportFormat,
}: FormatSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className='p-4'>
          <CollapsibleTrigger asChild>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base'>{t('builder.exportOptions')}</CardTitle>
                <CardDescription className='text-sm'>{exportFormat.toUpperCase()}</CardDescription>
              </div>
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='p-4 pt-0'>
            <ExportFormat defaultFormat={exportFormat} setDefaultFormat={setExportFormat} />
          </CardContent>
          <CardFooter className='p-4 pt-0'>
            <Button onClick={handleExport} disabled={isExporting} className='w-full'>
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
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
