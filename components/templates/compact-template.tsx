'use client';

import { useTranslation } from '@/hooks/use-translation';
import type { ResumeData } from '../resume-builder';
import Image from 'next/image';

interface CompactTemplateProps {
  data: ResumeData;
}

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
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      data-testid='compact-template'
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          gap: '1rem',
          width: '100%',
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
                flexShrink: 0,
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
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '0.875em' }}>
                {t('personalInfo.photo')}
              </span>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                margin: '0',
                lineHeight: '1.2',
              }}
            >
              {personalInfo.name || 'Your Name'}
            </h1>
            <h2 style={{ fontSize: '1.25em', color: '#4b5563', margin: '0.25em 0' }}>
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
                margin: '0',
                lineHeight: '1.25',
                fontSize: '0.875em',
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
                  return (
                    <li key={index}>
                      <span style={{ textTransform: 'capitalize' }}>{link.platform}:</span>{' '}
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
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ width: '70%' }}>
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125em',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {t('personalInfo.aboutMe')}
              </h3>
              <div style={{ fontSize: '0.875em' }}>
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
                  fontSize: '1.125em',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {t('experience.title')}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
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
                        fontSize: '0.875em',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                      }}
                    >
                      {exp.startDate} – {exp.current ? t('experience.present') : exp.endDate}
                    </p>
                    {exp.description && exp.description !== '' && (
                      <div
                        style={{
                          fontSize: '0.875em',
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
                            fontSize: '0.875em',
                            margin: '0.25rem 0',
                          }}
                        >
                          {t('experience.achievements')}:
                        </h5>
                        <ul
                          style={{
                            fontSize: '0.875em',
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
                            fontSize: '0.875em',
                            margin: '0.25rem 0',
                          }}
                        >
                          {t('experience.techStack')}:
                        </h5>
                        <p style={{ fontSize: '0.875em' }}>{exp.techStack}</p>
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
                  fontSize: '1.125em',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {t('skills.title')}
              </h3>
              <ul
                style={{
                  listStyleType: 'disc',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {skills.map((skill, index) => (
                  <li key={index} style={{ fontSize: '0.875em' }}>
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
                  fontSize: '1.125em',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}
              >
                {t('education.title')}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {education.map((edu, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: '0.875em',
                      display: edu.institution || edu.degree ? 'block' : 'none',
                    }}
                  >
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {edu.institution || t('education.institution')},{' '}
                      {edu.degree || t('education.degree')}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h4>
                    {edu.startDate && (
                      <p style={{ fontSize: '0.875em' }}>
                        {edu.startDate} – {edu.endDate || t('experience.present')}
                      </p>
                    )}
                    {edu.description && (
                      <p style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>{edu.description}</p>
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
