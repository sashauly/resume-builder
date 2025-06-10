'use client';

import { useTranslation } from '@/hooks/use-translation';
import type { ResumeData } from '../resume-builder';
import Image from 'next/image';
// import { Github, Send, Linkedin, Twitter, Globe } from 'lucide-react';

interface CompactTemplateProps {
  data: ResumeData;
}

// const getSocialIcon = (platform: string) => {
//   switch (platform) {
//     case 'github':
//       return Github;
//     case 'telegram':
//       return Send;
//     case 'linkedin':
//       return Linkedin;
//     case 'twitter':
//       return Twitter;
//     case 'website':
//       return Globe;
//     default:
//       return Globe;
//   }
// };

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

export function CompactTemplate({ data }: CompactTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      style={{ fontFamily: 'Arial, sans-serif' }}
      data-testid='compact-template'
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ width: '70%', display: 'flex', gap: '0.5rem' }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo || '/placeholder.svg'}
              alt={t('personalInfo.photo')}
              width={125}
              height={125}
              style={{
                width: '125px',
                height: '125px',
                objectFit: 'cover',
                borderRadius: '0.25rem',
              }}
            />
          ) : (
            <div
              style={{
                width: '125px',
                height: '125px',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {t('personalInfo.photo')}
              </span>
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0',
              }}
            >
              {personalInfo.name || 'Your Name'}
            </h1>
            <h2 style={{ fontSize: '1.25rem', color: '#4b5563' }}>
              {personalInfo.jobTitle || 'Job Title'}
            </h2>
          </div>
        </div>
        <div
          style={{
            width: '30%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <section>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                listStyleType: 'none',
                marginTop: '0',
                marginBottom: '0',
                lineHeight: '1.25',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {personalInfo.address && <li>{personalInfo.address}</li>}
              {personalInfo.email && (
                <li>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    style={{ color: '#2563eb', textDecoration: 'none' }}
                  >
                    {personalInfo.email}
                  </a>
                </li>
              )}
              {personalInfo.phone && (
                <li>
                  <a
                    href={`tel:${personalInfo.phone}`}
                    style={{ color: '#2563eb', textDecoration: 'none' }}
                  >
                    {personalInfo.phone}
                  </a>
                </li>
              )}
              {personalInfo.socialLinks &&
                personalInfo.socialLinks.map((link, index) => {
                  // const Icon = getSocialIcon(link.platform);
                  return (
                    <li key={index}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {link.platform}:
                      </span>{' '}
                      <a
                        href={getSocialUrl(link.platform, link.username)}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                      >
                        {link.username}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          display: 'flex',
          gap: '1.5rem',
          width: '100%',
          height: '100%',
        }}
      >
        <div style={{ width: '70%' }}>
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  marginBottom: '0',
                }}
              >
                {t('personalInfo.aboutMe')}
              </h3>
              <div style={{ fontSize: '0.875rem' }}>
                {personalInfo.summary.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '0.5rem' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.some((exp) => exp.company || exp.position) && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  marginBottom: '0',
                }}
              >
                {t('experience.title')}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  paddingLeft: '1rem',
                  listStyleType: 'none',
                  marginTop: '0',
                  marginBottom: '0',
                  lineHeight: '1.5',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {experience.map((exp, index) => (
                  <li
                    key={index}
                    style={{
                      display: exp.company || exp.position ? 'block' : 'none',
                    }}
                  >
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {exp.company || t('experience.company')},{' '}
                      {exp.location && exp.location !== '' && (
                        <>
                          {exp.location}
                          {exp.location && exp.position && ' | '}
                        </>
                      )}
                      {exp.position || t('experience.position')}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                      }}
                    >
                      {exp.startDate} –{' '}
                      {exp.current ? t('experience.present') : exp.endDate}
                    </p>
                    {exp.description && exp.description !== '' && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.625',
                        }}
                      >
                        {exp.description.split('\n').map((line, i) => (
                          <p key={i} style={{ marginBottom: '0.25rem' }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                    {exp.achievements && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <h5
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            margin: '0.25rem 0',
                          }}
                        >
                          {t('experience.achievements')}:
                        </h5>
                        <ul
                          style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.625',
                            listStyleType: 'disc',
                            marginLeft: '1rem',
                            paddingLeft: '0',
                            marginBottom: '0',
                          }}
                        >
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
                      <div style={{ marginTop: '0.5rem' }}>
                        <h5
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            margin: '0.25rem 0',
                          }}
                        >
                          {t('experience.techStack')}:
                        </h5>
                        <p style={{ fontSize: '0.875rem' }}>{exp.techStack}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ width: '30%' }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  marginBottom: '0',
                }}
              >
                {t('skills.title')}
              </h3>
              <ul
                style={{
                  listStyleType: 'disc',
                  padding: '0',
                  lineHeight: '1.25',
                  marginTop: '0',
                  marginBottom: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {skills.map((skill, index) => (
                  <li key={index} style={{ fontSize: '0.875rem' }}>
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education */}
          {education.some((edu) => edu.institution || edu.degree) && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  marginBottom: '0',
                }}
              >
                {t('education.title')}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  listStyleType: 'none',
                  marginTop: '0',
                  marginBottom: '0',
                  lineHeight: '1.25',
                }}
              >
                {education.map((edu, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      display: edu.institution || edu.degree ? 'block' : 'none',
                    }}
                  >
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {edu.institution || t('education.institution')},{' '}
                      {edu.degree || t('education.degree')}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h4>
                    {edu.startDate && (
                      <p style={{ fontSize: '0.875rem' }}>
                        {edu.startDate} –{' '}
                        {edu.endDate || t('experience.present')}
                      </p>
                    )}
                    {edu.description && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {edu.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
