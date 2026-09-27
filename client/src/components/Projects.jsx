import { ArrowUpRight } from "lucide-react";
import Section from "./Section";
import "./Project-showcase.css";

export default function Projects() {
  const projects = [
    {
      number: "01",
      name: "Everest Vacation",
      type: "TRAVEL",
      image: "/images/everest.jpg",
      description:
        "A modern travel experience built around destinations, tours and clean visual storytelling.",
      technologies: ["Next.js", "React", "Tailwind"],
      url: "https://everestnepaltours.com/",
    },
    {
      number: "02",
      name: "Project Two",
      type: "WEB",
      image: "/images/everest.jpg",
      description:
        "A modern interface focused on responsive layouts and smooth digital interactions.",
      technologies: ["React", "JavaScript", "Tailwind"],
      url: "https://everestnepaltours.com/",
    },
    {
      number: "03",
      name: "Project Three",
      type: "FRONTEND",
      image: "/images/everest.jpg",
      description:
        "A responsive frontend experience with a clean design system and modern technology.",
      technologies: ["React", "CSS", "JavaScript"],
      url: "https://everestnepaltours.com/",
    },
  ];

  return (
    <Section
      id="projects"
      number="04"
      label="PROJECTS"
      title={
        <>
          Turning Ideas <span className="muted">Into Interfaces.</span>
        </>
      }
    >
      <div className="section-subline reveal flex items-center justify-between gap-8 mx-[7%] mt-7 mb-10">
        <p className="m-0 max-w-lg text-sm leading-7">
          A curated selection of interfaces, experiments, and digital
          experiences.
        </p>

        <span className="example-label whitespace-nowrap">SELECTED WORK</span>
      </div>

      <div className="projects-grid grid grid-cols-3 gap-6 mx-[7%]">
        {projects.map((project) => (
          <article className="project-card reveal" key={project.number}>
            <div className="project-glow" />

            <div className="project-header flex items-center justify-between px-1 pt-1.5 pb-4">
              <span className="project-number">{project.number}</span>

              <span className="project-type">{project.type}</span>
            </div>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-visual block relative overflow-hidden no-underline"
            >
              <div className="project-image-frame">
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  decoding="async"
                  className="project-image"
                />

                <div className="image-grid" />

                <div className="project-hover">
                  <span>OPEN</span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
            </a>

            <div className="project-content flex flex-col pt-6 px-2 pb-2">
              <div className="project-title flex items-center justify-between gap-4">
                <h3 className="project-title-text">{project.name}</h3>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-arrow"
                  aria-label={`View ${project.name}`}
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-footer flex flex-col gap-4 mt-auto pt-6">
                <div className="project-tech flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <span className="project-tech-item" key={technology}>
                      {technology}
                    </span>
                  ))}
                </div>

                <div className="project-status flex items-center gap-2">
                  <span className="project-status-dot" />
                  LIVE
                </div>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-project"
                >
                  VIEW PROJECT
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
