import { useTranslation } from "@/hooks/use-translation";
import type { ResumeData } from "../resume-builder";
import { Github, Send, Linkedin, Twitter, Globe } from "lucide-react";

interface CompactTemplateProps {
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

export function CompactTemplate({ data }: CompactTemplateProps) {
  const { t } = useTranslation();
  const { personalInfo, education, experience, skills } = data;

  return (
    <div
      className="bg-white text-black min-h-[800px] p-6 font-sans"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="flex gap-4 mb-4">
        <div style={{ width: "70%" }} className="flex gap-2">
          {personalInfo.photo ? (
            <img
              src={personalInfo.photo || "/placeholder.svg"}
              alt={t("personalInfo.photo")}
              className="w-32 h-32 object-cover rounded"
              style={{ width: "125px", height: "125px" }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {t("personalInfo.photo")}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {personalInfo.name || "Your Name"}
            </h1>
            <h2 className="text-xl text-gray-700">
              {personalInfo.jobTitle || "Job Title"}
            </h2>
          </div>
        </div>
        <div style={{ width: "30%" }} className="flex flex-col gap-2">
          <section>
            <ul className="list-none p-0 space-y-1 text-sm">
              {personalInfo.address && <li>{personalInfo.address}</li>}
              {personalInfo.email && (
                <li>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {personalInfo.email}
                  </a>
                </li>
              )}
              {personalInfo.phone && (
                <li>
                  <a
                    href={`tel:${personalInfo.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {personalInfo.phone}
                  </a>
                </li>
              )}
              {personalInfo.socialLinks &&
                personalInfo.socialLinks.map((link, index) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <li key={index}>
                      <span className="capitalize">{link.platform}:</span>{" "}
                      <a
                        href={getSocialUrl(link.platform, link.username)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
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
      <main className="flex gap-6 w-full h-full">
        <div style={{ width: "70%" }}>
          {/* Summary */}
          {personalInfo.summary && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3">
                {t("personalInfo.aboutMe")}
              </h3>
              <div className="text-sm">
                {personalInfo.summary.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.some((exp) => exp.company || exp.position) && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3">
                {t("experience.title")}
              </h3>
              <ul className="list-none p-0 pl-4 space-y-6">
                {experience.map((exp, index) => (
                  <li
                    key={index}
                    className={exp.company || exp.position ? "" : "hidden"}
                  >
                    <h4 className="font-bold mb-1">
                      {exp.company || t("experience.company")},{" "}
                      {exp.location || t("experience.location")} |{" "}
                      {exp.position || t("experience.position")}
                    </h4>
                    <p className="text-sm mb-2 font-medium">
                      {exp.startDate} –{" "}
                      {exp.current ? t("experience.present") : exp.endDate}
                    </p>
                    {exp.description && (
                      <div className="text-sm leading-relaxed">
                        {exp.description.split("\n").map((line, i) => (
                          <p key={i} className="mb-1">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ width: "30%" }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3">{t("skills.title")}</h3>
              <ul className="list-disk p-0 space-y-1">
                {skills.map((skill, index) => (
                  <li key={index} className="text-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education */}
          {education.some((edu) => edu.institution || edu.degree) && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3">{t("education.title")}</h3>
              <ul className="list-none p-0 space-y-4">
                {education.map((edu, index) => (
                  <li
                    key={index}
                    className={
                      edu.institution || edu.degree ? "text-sm" : "hidden"
                    }
                  >
                    <h4 className="font-bold">
                      {edu.institution || t("education.institution")},{" "}
                      {edu.degree || t("education.degree")}
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    </h4>
                    {edu.startDate && (
                      <p className="text-sm">
                        {edu.startDate} –{" "}
                        {edu.endDate || t("experience.present")}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-sm mt-1">{edu.description}</p>
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
