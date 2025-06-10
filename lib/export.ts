import { ResumeData } from '@/components/resume-builder';
import html2canvas from 'html2canvas';

export interface ExportData {
  resumeData: ResumeData;
  resumeName: string;
  locale: string;
  exportFormat: 'image' | 'word' | 'html' | 'json';
}

// Helper function to clean up HTML for export
const cleanHtmlForExport = (htmlString: string): string => {
  // Create a temporary div to parse the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const bodyContent = doc.body;

  // Remove any specific IDs or highly dynamic classes that might interfere
  // with standalone usage or increase file size unnecessarily.
  // This is a basic example; you might need more sophisticated cleaning.
  bodyContent.querySelectorAll('*').forEach((element) => {
    element.removeAttribute('id');
    // You might want to keep some specific classes for styling if they are generic.
    // For a truly clean HTML, removing all utility classes and relying on base styles is best.
    // For now, let's remove most common dynamic/framework classes.
    // element.removeAttribute("class");
    element.removeAttribute('data-testid');
    // element.removeAttribute("style"); // Remove inline styles as we will apply base styles
  });

  // Optionally, you might want to replace specific components' HTML with simpler structures
  // For example, if your Button component renders complex divs, you might replace it with <button>
  // This part is highly dependent on your component library's output.

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

  // It's crucial to grab the *actual* rendered element.
  // The ResumePreview inside the dialog has the id="resume-preview-export"
  // because we passed it this ID.
  const resumeElement = document.getElementById('resume-preview-export');

  if (!resumeElement) {
    throw new Error('Resume element not found for export.');
  }

  // Create a temporary container for export, to ensure consistent rendering
  // for html2canvas (PDF/Image) and to get clean HTML for HTML export.
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px'; // Off-screen
  tempContainer.style.width = '800px'; // Fixed width for consistent capture
  tempContainer.style.padding = '20px'; // Maintain some padding

  // Clone the resume element into the temp container.
  // This is crucial because html2canvas needs an element in the DOM to render.
  // For HTML export, we also want the rendered HTML from the template.
  const clone = resumeElement.cloneNode(true) as HTMLElement;

  // Ensure any images are loaded before html2canvas runs
  const images = clone.querySelectorAll('img');
  const imageLoadPromises = Array.from(images).map((img) => {
    if (!img.complete) {
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve even if error
      });
    }
    return Promise.resolve();
  });
  await Promise.all(imageLoadPromises);

  // Append the clone to the document to allow for styling to apply if any
  document.body.appendChild(tempContainer);
  tempContainer.appendChild(clone); // Append clone to temp container

  // Now, proceed based on export format
  switch (exportFormat) {
    case 'image':
      // For PDF and Image, use html2canvas to capture the rendered content
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Important for images from different origins
        backgroundColor: '#ffffff', // Ensure white background
        logging: false,
      });

      // After canvas creation, remove the temporary container
      document.body.removeChild(tempContainer);

      // "image"
      const link = document.createElement('a');
      link.download = `${resumeName || 'resume'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      break;

    case 'html':
      // For HTML, get the innerHTML of the cloned element
      const rawTemplateHtml = clone.innerHTML;
      const cleanedHtml = cleanHtmlForExport(rawTemplateHtml);

      // Wrap the cleaned HTML in a full HTML document structure with basic styles
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
      URL.revokeObjectURL(htmlLink.href); // Clean up the URL object

      // Remove the temporary container after HTML export
      document.body.removeChild(tempContainer);
      break;

    case 'word':
      // The .doc export is still a simplified HTML representation.
      // It's not a full template-based HTML export because Word's rendering
      // of complex CSS from templates would be highly unpredictable.
      // We rely on html2canvas for visual fidelity (PDF/Image) or a simple
      // structured HTML (for Word and raw HTML if the template's HTML is too complex).
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
