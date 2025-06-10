import { useTranslation } from '@/hooks/use-translation';
import { Download } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { ExportFormat } from './export/export-dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card';
import { Button } from './ui/button';

interface FormatSelectorProps {
  exportFormat: 'image' | 'word' | 'html';
  handleExport: () => Promise<void>;
  isExporting: boolean;
  setExportFormat: Dispatch<SetStateAction<'image' | 'word' | 'html'>>;
}

export default function FormatSelector({
  exportFormat,
  handleExport,
  isExporting,
  setExportFormat,
}: FormatSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('builder.exportOptions')}</CardTitle>
        <CardDescription>{t('export.chooseFormat')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ExportFormat
          defaultFormat={exportFormat}
          setDefaultFormat={setExportFormat}
        />
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
