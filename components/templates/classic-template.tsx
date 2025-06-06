"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { ResumeData } from "../resume-builder";
import { Github, Send, Linkedin, Twitter, Globe } from "lucide-react";

interface ClassicTemplateProps {
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

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      className="bg-white text-black grid grid-cols-3 gap-0 font-serif"
      data-testid="classic-template"
    >
      {/* Left Sidebar */}
      <div className="bg-slate-800 text-white p-6 col-span-1">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {personalInfo.photo ? (
            <img
              src={personalInfo.photo || "/placeholder.svg"}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-32 h-32 bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold">
                {personalInfo.name
                  ? personalInfo.name.charAt(0).toUpperCase()
                  : "?"}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold mb-2">
            {personalInfo.name || "Your Name"}
          </h1>
          {personalInfo.jobTitle && (
            <p className="text-blue-200 text-sm">{personalInfo.jobTitle}</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-blue-300">
            {t("personalInfo.contactInfo")}
          </h3>
          <div className="space-y-2 text-sm">
            {personalInfo.phone && (
              <a
                href={`tel:${personalInfo.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-200 hover:text-blue-100"
              >
                📞 {personalInfo.phone}
              </a>
            )}
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-200 hover:text-blue-100"
              >
                ✉️ {personalInfo.email}
              </a>
            )}
            {personalInfo.address && <p>📍 {personalInfo.address}</p>}
          </div>
        </div>

        {/* Social Links */}
        {personalInfo.socialLinks && personalInfo.socialLinks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-blue-300">
              {t("personalInfo.socialLinks")}
            </h3>
            <div className="space-y-2 text-sm">
              {personalInfo.socialLinks.map((link, index) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <a
                      href={getSocialUrl(link.platform, link.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-200 hover:text-blue-100"
                    >
                      {link.username}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education */}
        {education.some((edu) => edu.institution || edu.degree) && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-blue-300">
              {t("education.title")}
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className={
                    edu.institution || edu.degree ? "text-sm" : "hidden"
                  }
                >
                  <h4 className="font-semibold text-blue-200">
                    {edu.degree || t("education.degree")}
                  </h4>
                  <p className="text-gray-300">
                    {edu.institution || t("education.institution")}
                  </p>
                  {edu.fieldOfStudy && (
                    <p className="text-gray-400">{edu.fieldOfStudy}</p>
                  )}
                  {edu.startDate && (
                    <p className="text-gray-400 text-xs">
                      {edu.startDate} - {edu.endDate || t("experience.present")}
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
            <h3 className="text-lg font-bold mb-4 text-blue-300">
              {t("skills.title")}
            </h3>
            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-slate-700 px-2 py-1 rounded text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="col-span-2 p-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b-2 border-slate-800 pb-2 mb-4">
              {t("personalInfo.aboutMe")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.some((exp) => exp.company || exp.position) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b-2 border-slate-800 pb-2 mb-4">
              {t("experience.title")}
            </h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className={exp.company || exp.position ? "" : "hidden"}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {exp.position || t("experience.position")}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {exp.company || t("experience.company")}
                        {exp.location ? `, ${exp.location}` : ""}
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
                      <h4 className="font-semibold text-sm mb-2">
                        Achievements:
                      </h4>
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
                      <h4 className="font-semibold text-sm mb-2">
                        Technologies:
                      </h4>
                      <p className="text-gray-700 text-sm">{exp.techStack}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
