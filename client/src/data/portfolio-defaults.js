// Original frontend content retained as the initial render while CMS requests run.
export const defaultSkillGroups = [
  {
    id: "skills-frontend",
    label: "FRONTEND",
    number: "01 / 03",
    skills: [
      {
        name: "HTML & CSS",
        logo: "html-css",
        description: "Semantic structure and responsive styling for the web.",
        tag: "HTML5 / CSS3",
      },
      {
        name: "JavaScript",
        logo: "js",
        description: "Brings interactivity and logic to the web.",
        tag: "ES6+",
      },
      {
        name: "React",
        logo: "react",
        description: "Component-based UI development.",
        tag: "React",
      },
      {
        name: "Tailwind CSS",
        logo: "tailwind",
        description: "Utility-first CSS for faster design.",
        tag: "Tailwind",
      },
    ],
  },
  {
    id: "skills-design",
    label: "DESIGN",
    number: "02 / 03",
    skills: [
      {
        name: "Figma",
        logo: "figma",
        description: "Designing clean and user-friendly interfaces.",
        tag: "Figma",
      },
      {
        name: "UI / UX",
        logo: "design",
        description: "Creating simple and beautiful experiences.",
        tag: "Design",
      },
      {
        name: "Photoshop",
        logo: "ps",
        description: "Editing and creating visuals and assets.",
        tag: "Photoshop",
      },
      {
        name: "Illustrator",
        logo: "ai",
        description: "Vector graphics and brand elements.",
        tag: "Illustrator",
      },
    ],
  },
  {
    id: "skills-backend",
    label: "BACKEND & TOOLS",
    number: "03 / 03",
    skills: [
      {
        name: "Node.js",
        logo: "node",
        description: "Server-side development with JavaScript.",
        tag: "Node.js",
      },
      {
        name: "Git",
        logo: "git",
        id: "skills-tools",
        description: "Version control for better workflow.",
        tag: "Git",
      },
      {
        name: "GitHub",
        logo: "github",
        description: "Code hosting and collaboration.",
        tag: "GitHub",
      },
      {
        name: "VS Code",
        logo: "vscode",
        description: "My main code editor for development.",
        tag: "VS Code",
      },
    ],
  },
];

export const defaultProjects = [
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
