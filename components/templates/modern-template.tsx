'use client';

import { useTranslation } from '@/hooks/use-translation';
import type { ResumeData } from '../resume-builder';
import { Github, Send, Linkedin, Twitter, Globe } from 'lucide-react';
import Image from 'next/image';

interface ModernTemplateProps {
  data: ResumeData;
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'github':
      return Github;
    case 'telegram':
      return Send;
    case 'linkedin':
      return Linkedin;
    case 'twitter':
      return Twitter;
    case 'website':
      return Globe;
    default:
      return Globe;
  }
};

const getSocialUrl = (platform: string, username: string) => {
  switch (platform) {
    case 'github':
      return `https://github.com/${username}`;
    case 'telegram':
      return `https://t.me/${username}`;
    case 'linkedin':
      return `https://linkedin.com/in/${username}`;
    case 'twitter':
      return `https://twitter.com/${username}`;
    case 'website':
      return username.startsWith('http') ? username : `https://${username}`;
    default:
      return username;
  }
};

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      className='bg-white font-sans text-gray-900'
      data-testid='modern-template'
    >
      {/* Header */}
      <div className='mb-12 text-center'>
        {personalInfo.photo && (
          <Image
            src={personalInfo.photo || '/placeholder.svg'}
            alt='Profile'
            width={132}
            height={132}
            className='mx-auto mb-4 size-24 rounded-full object-cover'
          />
        )}
        <h1 className='mb-2 text-4xl font-light'>
          {personalInfo.name || 'Your Name'}
        </h1>
        {personalInfo.jobTitle && (
          <h2 className='mb-4 text-xl text-gray-600'>
            {personalInfo.jobTitle}
          </h2>
        )}
        <div className='flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600'>
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              {personalInfo.email}
            </a>
          )}
          {personalInfo.phone && <span>•</span>}
          {personalInfo.phone && (
            <a
              href={`tel:${personalInfo.phone}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              {personalInfo.phone}
            </a>
          )}
          {personalInfo.address && <span>•</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>

        {/* Social Links */}
        {personalInfo.socialLinks && personalInfo.socialLinks.length > 0 && (
          <div className='mt-4 flex items-center justify-center gap-4'>
            {personalInfo.socialLinks.map((link, index) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a
                  key={index}
                  href={getSocialUrl(link.platform, link.username)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800'
                >
                  <Icon className='size-4' />
                  {link.username}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className='mb-10'>
          <h2 className='mb-4 text-xl font-light text-gray-800'>
            {t('personalInfo.aboutMe')}
          </h2>
          <p className='leading-relaxed text-gray-700'>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.some((exp) => exp.company || exp.position) && (
        <div className='mb-10'>
          <h2 className='mb-6 text-xl font-light text-gray-800'>
            {t('experience.title')}
          </h2>
          <div className='space-y-8'>
            {experience.map((exp, index) => (
              <div
                key={index}
                className={exp.company || exp.position ? '' : 'hidden'}
              >
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <h3 className='text-lg font-medium'>
                      {exp.position || t('experience.position')}
                    </h3>
                    <p className='text-gray-600'>
                      {exp.company || t('experience.company')}
                      {exp.location ? ` • ${exp.location}` : ''}
                    </p>
                  </div>
                  {exp.startDate && (
                    <div className='text-sm text-gray-500'>
                      {exp.startDate} -{' '}
                      {exp.current ? t('experience.present') : exp.endDate}
                    </div>
                  )}
                </div>
                {exp.description && (
                  <p className='leading-relaxed text-gray-700'>
                    {exp.description}
                  </p>
                )}
                {exp.achievements && (
                  <div className='mt-3'>
                    <h4 className='mb-2 text-sm font-medium'>Achievements:</h4>
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
                    <h4 className='mb-2 text-sm font-medium'>Technologies:</h4>
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
        <div className='mb-10'>
          <h2 className='mb-6 text-xl font-light text-gray-800'>
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
                    <h3 className='font-medium'>
                      {edu.degree || t('education.degree')}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
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
          <h2 className='mb-6 text-xl font-light text-gray-800'>
            {t('skills.title')}
          </h2>
          <div className='flex flex-wrap gap-2'>
            {skills.map((skill, index) => (
              <span
                key={index}
                className='rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700'
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
