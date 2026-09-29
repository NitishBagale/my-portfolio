import { usePublicContent } from "../hooks/usePublicContent";
import { useState } from "react";
import { Atom, Wind, GitBranch, Code, ArrowRight } from "lucide-react";
import "./Skills.css";
import { defaultSkillGroups } from "../data/portfolio-defaults";

const defaultSkills = {
  topLabel: "03 / SKILLS",
  kicker: "WHAT I WORK WITH",
  heading: "Tools & Technologies",
  description: "I use modern tools and technologies to build fast, responsive and beautiful web experiences.",
  learningText: "Always learning, always improving.",
  groups: defaultSkillGroups,
};

function TechnologyLogo({ type }) {
  if (type === "html-css") {
    return (
      <span className="toolkit-logo-pair">
        <TechnologyLogo type="html" />
        <TechnologyLogo type="css" />
      </span>
    );
  }

  const icons = {
    react: Atom,
    tailwind: Wind,
    design: GitBranch,
    git: GitBranch,
    vscode: Code,
  };

  const Icon = icons[type];

  if (type === "github") {
    return (
      <svg
        className="toolkit-logo toolkit-logo--github"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.21.7-3.89-1.37-3.89-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a11.02 11.02 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.42.36.78 1.06.78 2.14v3.27c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
      </svg>
    );
  }

  if (type === "figma") {
    return (
      <svg className="toolkit-logo" viewBox="0 0 30 45" aria-hidden="true">
        <path fill="#f24e1e" d="M7.5 0H15v15H7.5a7.5 7.5 0 0 1 0-15" />
        <path fill="#ff7262" d="M15 0h7.5a7.5 7.5 0 0 1 0 15H15" />
        <path fill="#FF8C00" d="M7.5 15H15v15H7.5a7.5 7.5 0 0 1 0-15" />
        <circle fill="#1abcfe" cx="22.5" cy="22.5" r="7.5" />
        <path fill="#0acf83" d="M7.5 30H15v7.5A7.5 7.5 0 1 1 7.5 30" />
      </svg>
    );
  }

  if (type === "node") {
    return (
      <svg className="toolkit-logo" viewBox="0 0 40 44" aria-hidden="true">
        <path
          d="M20 2 37 12v20L20 42 3 32V12Z"
          fill="none"
          stroke="#65c75b"
          strokeWidth="2"
        />
        <text x="20" y="29" fill="#65c75b" textAnchor="middle" fontSize="20">
          JS
        </text>
      </svg>
    );
  }

  if (type === "html" || type === "css") {
    return (
      <svg
        className={`toolkit-logo toolkit-logo--${type}`}
        viewBox="0 0 40 44"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M3 2h34l-3 35-14 5-14-5z" />
        <path fill="#ffffff25" d="M20 5h13l-3 29-10 4z" />
        <text
          x="20"
          y="31"
          textAnchor="middle"
          fill="#080c12"
          fontSize="30"
          fontWeight="800"
        >
          {type === "html" ? "5" : "3"}
        </text>
      </svg>
    );
  }

  if (Icon) {
    return (
      <span
        className={`toolkit-logo toolkit-logo--${type}`}
        aria-hidden="true"
      >
        <Icon
          size={40}
          strokeWidth={type === "react" ? 1.3 : 1.8}
        />
      </span>
    );
  }

  const text = {
    js: "JS",
    ps: "Ps",
    ai: "Ai",
    node: "JS",
    express: "ex",
  };

  return (
    <span
      className={`toolkit-logo toolkit-logo--${type}`}
      aria-hidden="true"
    >
      {text[type]}
    </span>
  );
}

function SkillGroup({ id, label, number, skills }) {
  return (
    <div id={id} className="toolkit-group">
      <div className="toolkit-group-heading">
        <h3>{label}</h3>
        <span>{number}</span>
      </div>

      <ul
        className="toolkit-tiles"
        style={{ "--columns": skills.length }}
      >
        {skills.map((skill) => (
          <li
            className="toolkit-tile"
            key={skill.name}
            id={skill.id}
          >
            <TechnologyLogo type={skill.logo} />

            <h4>{skill.name}</h4>

            <span className="toolkit-skill-tag">
              {skill.tag}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("Frontend");

  const { content: skillsContent, ready } = usePublicContent("skills", defaultSkills);

  const {
    topLabel,
    kicker,
    heading,
    description,
    learningText,
    groups,
  } = skillsContent;

  const headingParts = heading.split(" ");

  const firstHeadingPart = headingParts.slice(0, 2).join(" ");
  const secondHeadingPart = headingParts.slice(2).join(" ");

  return (
    <section
      id="skills"
      aria-busy={!ready}
      className="toolkit-section"
      aria-labelledby="skills-heading"
    >
      <div className="toolkit-layout" style={{ visibility: ready ? undefined : "hidden" }}>
        <header className="toolkit-introduction">
          <p className="toolkit-eyebrow">
            {topLabel}
            <span aria-hidden="true" />
          </p>

          <p className="toolkit-kicker">
            {kicker}
          </p>

          <h2 id="skills-heading">
            {firstHeadingPart}
            <br />
            <span>{secondHeadingPart}</span>
          </h2>

          <p className="toolkit-intro">
            {description}
          </p>

          <nav
            className="toolkit-categories"
            aria-label="Skill categories"
          >
            {[
              ["Frontend", "skills-frontend"],
              ["Design", "skills-design"],
              ["Backend", "skills-backend"],
              ["Tools", "skills-tools"],
            ].map(([label, target]) => (
              <a
                href={`#${target}`}
                key={label}
                onClick={() => setActiveCategory(label)}
                aria-current={
                  activeCategory === label
                    ? "true"
                    : undefined
                }
              >
                <span aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          <div className="toolkit-learning">
            <span aria-hidden="true">
              <ArrowRight size={23} />
            </span>

            <p>
              {learningText}
            </p>
          </div>
        </header>

        <div className="toolkit-groups">
          {groups.map((group) => (
            <SkillGroup
              key={group.id}
              {...group}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
