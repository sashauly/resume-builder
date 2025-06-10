'use client';

import { useTranslation } from '@/hooks/use-translation';
import type { ResumeData } from '../resume-builder';

interface ProfessionalTemplateProps {
  data: ResumeData;
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      className='bg-white font-serif text-gray-900'
      data-testid='professional-template'
    >
      {/* Header */}
      <div className='mb-8 border-b-2 border-gray-300 pb-6'>
        <h1 className='mb-2 text-3xl font-bold'>
          {personalInfo.name || 'Your Name'}
        </h1>
        <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
          <div>
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                target='_blank'
                rel='noopener noreferrer'
                className='block'
              >
                {t('personalInfo.email')}: {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && (
              <a
                href={`tel:${personalInfo.phone}`}
                target='_blank'
                rel='noopener noreferrer'
                className='block'
              >
                {t('personalInfo.phone')}: {personalInfo.phone}
              </a>
            )}
          </div>
          <div>
            {personalInfo.address && (
              <p>
                {t('personalInfo.address')}: {personalInfo.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className='mb-8'>
          <h2 className='mb-3 text-lg font-bold uppercase tracking-wide text-gray-800'>
            {t('personalInfo.aboutMe')}
          </h2>
          <p className='leading-relaxed text-gray-700'>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.some((exp) => exp.company || exp.position) && (
        <div className='mb-8'>
          <h2 className='mb-4 text-lg font-bold uppercase tracking-wide text-gray-800'>
            {t('experience.title')}
          </h2>
          <div className='space-y-6'>
            {experience.map((exp, index) => (
              <div
                key={index}
                className={exp.company || exp.position ? '' : 'hidden'}
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div>
                    <h3 className='text-base font-bold'>
                      {exp.position || t('experience.position')}
                    </h3>
                    <p className='font-medium text-gray-600'>
                      {exp.company || t('experience.company')}
                      {exp.location ? ` | ${exp.location}` : ''}
                    </p>
                  </div>
                  {exp.startDate && (
                    <div className='text-sm font-medium text-gray-500'>
                      {exp.startDate} -{' '}
                      {exp.current ? t('experience.present') : exp.endDate}
                    </div>
                  )}
                </div>
                {exp.description && (
                  <ul className='ml-4 leading-relaxed text-gray-700'>
                    {exp.description.split('\n').map((line, i) => (
                      <li key={i} className='list-disc'>
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
                {exp.achievements && (
                  <div className='mt-3'>
                    <h4 className='mb-2 text-sm font-bold'>Achievements:</h4>
                    <ul className='ml-4 list-disc text-sm leading-relaxed text-gray-700'>
                      {exp.achievements
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((achievement, i) => (
                          <li key={i}>{achievement.trim()}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {exp.techStack && (
                  <div className='mt-3'>
                    <h4 className='mb-2 text-sm font-bold'>Technologies:</h4>
                    <p className='text-sm text-gray-700'>{exp.techStack}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.some((edu) => edu.institution || edu.degree) && (
        <div className='mb-8'>
          <h2 className='mb-4 text-lg font-bold uppercase tracking-wide text-gray-800'>
            {t('education.title')}
          </h2>
          <div className='space-y-4'>
            {education.map((edu, index) => (
              <div
                key={index}
                className={edu.institution || edu.degree ? '' : 'hidden'}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-bold'>
                      {edu.degree || t('education.degree')}
                      {edu.fieldOfStudy ? ` - ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <p className='text-gray-600'>
                      {edu.institution || t('education.institution')}
                    </p>
                  </div>
                  {edu.startDate && (
                    <div className='text-sm text-gray-500'>
                      {edu.startDate} - {edu.endDate || t('experience.present')}
                    </div>
                  )}
                </div>
                {edu.description && (
                  <p className='mt-1 text-sm text-gray-700'>
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className='mb-4 text-lg font-bold uppercase tracking-wide text-gray-800'>
            {t('skills.title')}
          </h2>
          <div className='grid grid-cols-3 gap-2'>
            {skills.map((skill, index) => (
              <div key={index} className='text-sm text-gray-700'>
                • {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
