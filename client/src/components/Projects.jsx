import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Section from "./Section";
import "./Project-showcase.css";

import { API_URL } from "../config/api";
import defaults from "../data/projects-content.json";
import { defaultProjects } from "../data/portfolio-defaults";

export default function Projects() {
  const [content, setContent] = useState(defaults);
  const [projects, setProjects] = useState(defaultProjects);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/content/projects`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch projects section content");
        return response.json();
      })
      .then((data) => setContent({ ...defaults, ...data }))
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid projects response");
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Section
      id="projects"
      number={content.number}
      label={content.label}
      title={
        <>
          {content.heading} <span className="muted">{content.headingAccent}</span>
        </>
      }
    >
      <div className="section-subline reveal flex items-center justify-between gap-8 mx-[7%] mt-7 mb-10">
        <p className="m-0 max-w-lg text-sm leading-7">
          {content.description}
        </p>

        <span className="example-label whitespace-nowrap">
          {content.selectedWorkLabel}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="mx-[7%] py-16 text-center">
          <p className="text-sm text-white/50">
            No projects available.
          </p>
        </div>
      ) : (
        <div className="projects-grid grid grid-cols-3 gap-6 mx-[7%]">
          {projects.map((project) => (
            <article
              className="project-card reveal"
              key={project.id ?? project.number}
            >
              <div className="project-glow" />

              <div className="project-header flex items-center justify-between px-1 pt-1.5 pb-4">
                <span className="project-number">
                  {project.number}
                </span>

                <span className="project-type">
                  {project.type}
                </span>
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
                  <h3 className="project-title-text">
                    {project.name}
                  </h3>

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

                <p className="project-description">
                  {project.description}
                </p>

                <div className="project-footer flex flex-col gap-4 mt-auto pt-6">
                  <div className="project-tech flex flex-wrap gap-2">
                    {Array.isArray(project.technologies) &&
                      project.technologies.map((technology) => (
                        <span
                          className="project-tech-item"
                          key={technology}
                        >
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
      )}
    </Section>
  );
}
