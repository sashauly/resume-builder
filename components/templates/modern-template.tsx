"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { ResumeData } from "../resume-builder";
import { Github, Send, Linkedin, Twitter, Globe } from "lucide-react";

interface ModernTemplateProps {
  data: ResumeData;
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "github":
      return Github;
    case "telegram":
      return Send;
    case "linkedin":
      return Linkedin;
    case "twitter":
      return Twitter;
    case "website":
      return Globe;
    default:
      return Globe;
  }
};

const getSocialUrl = (platform: string, username: string) => {
  switch (platform) {
    case "github":
      return `https://github.com/${username}`;
    case "telegram":
      return `https://t.me/${username}`;
    case "linkedin":
      return `https://linkedin.com/in/${username}`;
    case "twitter":
      return `https://twitter.com/${username}`;
    case "website":
      return username.startsWith("http") ? username : `https://${username}`;
    default:
      return username;
  }
};

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      className="bg-white text-gray-900 font-sans"
      data-testid="modern-template"
    >
      {/* Header */}
      <div className="text-center mb-12">
        {personalInfo.photo && (
          <img
            src={personalInfo.photo || "/placeholder.svg"}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-4xl font-light mb-2">
          {personalInfo.name || "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <h2 className="text-xl text-gray-600 mb-4">
            {personalInfo.jobTitle}
          </h2>
        )}
        <div className="flex justify-center items-center gap-4 text-gray-600 text-sm flex-wrap">
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {personalInfo.email}
            </a>
          )}
          {personalInfo.phone && <span>•</span>}
          {personalInfo.phone && (
            <a
              href={`tel:${personalInfo.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {personalInfo.phone}
            </a>
          )}
          {personalInfo.address && <span>•</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>

        {/* Social Links */}
        {personalInfo.socialLinks && personalInfo.socialLinks.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            {personalInfo.socialLinks.map((link, index) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a
                  key={index}
                  href={getSocialUrl(link.platform, link.username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {link.username}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-10">
          <h2 className="text-xl font-light mb-4 text-gray-800">
            {t("personalInfo.aboutMe")}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.some((exp) => exp.company || exp.position) && (
        <div className="mb-10">
          <h2 className="text-xl font-light mb-6 text-gray-800">
            {t("experience.title")}
          </h2>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div
                key={index}
                className={exp.company || exp.position ? "" : "hidden"}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium">
                      {exp.position || t("experience.position")}
                    </h3>
                    <p className="text-gray-600">
                      {exp.company || t("experience.company")}
                      {exp.location ? ` • ${exp.location}` : ""}
                    </p>
                  </div>
                  {exp.startDate && (
                    <div className="text-gray-500 text-sm">
                      {exp.startDate} -{" "}
                      {exp.current ? t("experience.present") : exp.endDate}
                    </div>
                  )}
                </div>
                {exp.description && (
                  <p className="text-gray-700 leading-relaxed">
                    {exp.description}
                  </p>
                )}
                {exp.achievements && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Achievements:</h4>
                    <ul className="text-gray-700 text-sm leading-relaxed list-disc ml-4">
                      {exp.achievements
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((achievement, i) => (
                          <li key={i}>{achievement.trim()}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {exp.techStack && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Technologies:</h4>
                    <p className="text-gray-700 text-sm">{exp.techStack}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.some((edu) => edu.institution || edu.degree) && (
        <div className="mb-10">
          <h2 className="text-xl font-light mb-6 text-gray-800">
            {t("education.title")}
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div
                key={index}
                className={edu.institution || edu.degree ? "" : "hidden"}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {edu.degree || t("education.degree")}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <p className="text-gray-600">
                      {edu.institution || t("education.institution")}
                    </p>
                  </div>
                  {edu.startDate && (
                    <div className="text-gray-500 text-sm">
                      {edu.startDate} - {edu.endDate || t("experience.present")}
                    </div>
                  )}
                </div>
                {edu.description && (
                  <p className="text-gray-700 text-sm mt-1">
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
          <h2 className="text-xl font-light mb-6 text-gray-800">
            {t("skills.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
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
