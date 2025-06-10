import { ResumeData } from '@/components/resume-builder';
import html2canvas from 'html2canvas';

export interface ExportData {
  resumeData: ResumeData;
  resumeName: string;
  locale: string;
  exportFormat: 'image' | 'word' | 'html' | 'json';
}

const cleanHtmlForExport = (htmlString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const bodyContent = doc.body;

  bodyContent.querySelectorAll('*').forEach((element) => {
    element.removeAttribute('id');

    element.removeAttribute('data-testid');
  });

  return bodyContent.innerHTML;
};

export default async function exportResume(exportData: ExportData) {
  const { resumeData, resumeName, locale, exportFormat } = exportData;

  if (exportFormat === 'json') {
    const json = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resumeName || 'resume'}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }

  const resumeElement = document.getElementById('resume-preview-export');

  if (!resumeElement) {
    throw new Error('Resume element not found for export.');
  }

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '800px';
  tempContainer.style.padding = '20px';

  const clone = resumeElement.cloneNode(true) as HTMLElement;

  const images = clone.querySelectorAll('img');
  const imageLoadPromises = Array.from(images).map((img) => {
    if (!img.complete) {
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }
    return Promise.resolve();
  });
  await Promise.all(imageLoadPromises);

  document.body.appendChild(tempContainer);
  tempContainer.appendChild(clone);

  switch (exportFormat) {
    case 'image':
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      document.body.removeChild(tempContainer);

      const link = document.createElement('a');
      link.download = `${resumeName || 'resume'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      break;

    case 'html':
      const rawTemplateHtml = clone.innerHTML;
      const cleanedHtml = cleanHtmlForExport(rawTemplateHtml);

      const fullHtmlContent = `
            <!DOCTYPE html>
            <html lang="${locale}">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${resumeName || 'Resume'}</title>
            </head>
            <body>
              ${cleanedHtml}
            </body>
            </html>
          `;

      const blob = new Blob([fullHtmlContent], { type: 'text/html' });
      const htmlLink = document.createElement('a');
      htmlLink.href = URL.createObjectURL(blob);
      htmlLink.download = `${resumeName || 'resume'}.html`;
      htmlLink.click();
      URL.revokeObjectURL(htmlLink.href);

      document.body.removeChild(tempContainer);
      break;

    case 'word':
      const wordHtmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>${resumeName || 'Resume'}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  h1, h2 { color: #2c3e50; }
                  ul { list-style-type: disc; margin-left: 20px; }
                </style>
              </head>
              <body>
                <h1>${resumeData.personalInfo.name || 'Resume'}</h1>
                <p>${resumeData.personalInfo.jobTitle || ''}</p>
                <p>${resumeData.personalInfo.email || ''} | ${resumeData.personalInfo.phone || ''} | ${resumeData.personalInfo.address || ''}</p>
                ${resumeData.personalInfo.socialLinks
                  .map((link) => `<p>${link.platform}: ${link.url}</p>`)
                  .join('')}
                
                ${
                  resumeData.personalInfo.summary
                    ? `<h2>Summary</h2><p>${resumeData.personalInfo.summary}</p>`
                    : ''
                }
                    
                <h2>Experience</h2>
                ${resumeData.experience
                  .map(
                    (exp) => `
                  <div>
                    <h3>${exp.position} at ${exp.company}, ${exp.location}</h3>
                    <p>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                    <p>${exp.description}</p>
                    ${
                      exp.achievements
                        ? `<p><strong>Achievements:</strong> ${exp.achievements}</p>`
                        : ''
                    }
                    ${
                      exp.techStack
                        ? `<p><strong>Tech Stack:</strong> ${exp.techStack}</p>`
                        : ''
                    }
                  </div>
                `,
                  )
                  .join('')}
                
                <h2>Education</h2>
                ${resumeData.education
                  .map(
                    (edu) => `
                  <div>
                    <h3>${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p>${edu.institution}</p>
                    <p>${edu.startDate} - ${edu.endDate || 'Present'}</p>
                    ${edu.description ? `<p>${edu.description}</p>` : ''}
                  </div>
                `,
                  )
                  .join('')}
                
                <h2>Skills</h2>
                <ul>
                  ${resumeData.skills
                    .map((skill) => `<li>${skill}</li>`)
                    .join('')}
                </ul>
              </body>
              </html>
            `;

      const wordBlob = new Blob([wordHtmlContent], {
        type: 'application/msword',
      });
      const wordLink = document.createElement('a');
      wordLink.href = URL.createObjectURL(wordBlob);
      wordLink.download = `${resumeName || 'resume'}.doc`;
      wordLink.click();
      URL.revokeObjectURL(wordLink.href);
      break;
  }
}
