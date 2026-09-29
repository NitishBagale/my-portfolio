import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Globe,
  Home,
  User,
  Code2,
  FolderKanban,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Pencil,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { API_URL } from "../config/api";
import { normalizeHero, applySavedContent } from "../config/content";
import NavigationFooterEditor from "./NavigationFooterEditor";
import ProjectsContentEditor from "./ProjectsContentEditor";

const ACCENT = "#FF8C00";

const defaultHero = {
  topLabel: "01 / HOME",
  name: "NITISH BAGALE",
  description:
    "I design and build modern digital experiences with clean code, thoughtful interactions, and a focus on the details.",
  primaryButton: "VIEW MY WORK",
  secondaryButton: "GET IN TOUCH",
};

const defaultAbout = {
  topLabel: "02 / ABOUT",
  heading: "Turning Ideas Into Digital Experiences.",
  description:
    "I'm a developer focused on creating modern, responsive, and thoughtful digital experiences.",
  buttonText: "MORE ABOUT ME",
  cards: [],
};

const defaultSkills = {
  topLabel: "03 / SKILLS",
  kicker: "WHAT I WORK WITH",
  heading: "Tools & Technologies",
  description:
    "I use modern tools and technologies to build responsive, interactive, and scalable digital experiences.",
  learningText: "Always learning, always improving.",
  groups: [],
};

const defaultContact = {
  topLabel: "CONTACT",
  heading: "Let's build something great.",
  badge: "GOOD IDEAS START WITH A HELLO",
  mainTitle: "Your next idea.",
  mainTitleAccent: "Our next conversation.",
  description:
    "A website, a collaboration, or just a question. Tell me what you have in mind and let's see what we can create together.",
  noteTitle: "A little detail goes a long way.",
  noteDescription:
    "Share your idea, goals, and timeline. I'll take it from there.",
  signature: "Thoughtful design. Clean code.",
  signatureAccent: "A personal touch.",
  formLabel: "LET'S CONNECT",
  formTitle: "Send a message",
  nameLabel: "Your name",
  namePlaceholder: "How should I call you?",
  emailLabel: "Email address",
  emailPlaceholder: "you@example.com",
  messageLabel: "What's on your mind?",
  messagePlaceholder: "Tell me a little about your project...",
  submitText: "Send message",
  formHint: "Just a conversation. No commitment required.",
};

const emptyProject = {
  number: "",
  name: "",
  type: "",
  image: "",
  description: "",
  technologies: [],
  url: "",
  isPublished: true,
};

export default function AdminDashboard() {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken")
  );

  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("adminUser") || "null"
      );
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [websiteOpen, setWebsiteOpen] = useState(true);

  const [error, setError] = useState("");

  /* =========================
     DASHBOARD DATA
  ========================= */

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [messagesRefresh, setMessagesRefresh] = useState(0);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [messageDeleteError, setMessageDeleteError] = useState("");
  const [messageDeleteSuccess, setMessageDeleteSuccess] = useState("");
  const [projects, setProjects] = useState([]);

  const [hero, setHero] = useState(defaultHero);
  const [about, setAbout] = useState(defaultAbout);
  const [skills, setSkills] = useState(defaultSkills);
  const [contact, setContact] = useState(defaultContact);

  const [heroLoading, setHeroLoading] = useState(true);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [savingHero, setSavingHero] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  const [heroMessage, setHeroMessage] = useState("");
  const [aboutMessage, setAboutMessage] = useState("");
  const [skillsMessage, setSkillsMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  /* =========================
     INNER EDITORS
  ========================= */

  const [editingCard, setEditingCard] = useState(null);

  const [editingGroup, setEditingGroup] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);

  /* =========================
     PROJECT STATE
  ========================= */

  const [projectEditorOpen, setProjectEditorOpen] =
    useState(false);

  const [editingProject, setEditingProject] = useState(null);

  const [projectForm, setProjectForm] =
    useState(emptyProject);

  const [technologyInput, setTechnologyInput] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [projectMessage, setProjectMessage] = useState("");

  /* =========================
     AUTH
  ========================= */

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

 const handleLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  setToken(null);
  setAdminUser(null);

  window.location.href = "/admin/login";
};

  /* =========================
     PAGE SELECT
  ========================= */

  const selectPage = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setError("");
  };

  /* =========================
     FETCH ALL CONTENT
  ========================= */

  useEffect(() => {
    if (!token) return;

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
      setError("");

      try {
        const [
          heroResponse,
          aboutResponse,
          skillsResponse,
          contactResponse,
          projectsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/admin/content/hero`, {
            headers: authHeaders,
          }),

          fetch(`${API_URL}/api/admin/content/about`, {
            headers: authHeaders,
          }),

          fetch(`${API_URL}/api/admin/content/skills`, {
            headers: authHeaders,
          }),

          fetch(`${API_URL}/api/admin/content/contact`, {
            headers: authHeaders,
          }),

          fetch(`${API_URL}/api/admin/projects`, {
            headers: authHeaders,
          }),

        ]);

        if (
          heroResponse.status === 401 ||
          aboutResponse.status === 401 ||
          skillsResponse.status === 401 ||
          contactResponse.status === 401 ||
          projectsResponse.status === 401
        ) {
          handleLogout();
          return;
        }

        if (heroResponse.ok) {
          const data = await heroResponse.json();

          setHero({
            ...defaultHero,
            ...normalizeHero(data.content ?? data),
          });
        }

        if (aboutResponse.ok) {
          const data = await aboutResponse.json();

          setAbout({
            ...defaultAbout,
            ...(data.content || data),
          });
        }

        if (skillsResponse.ok) {
          const data = await skillsResponse.json();

          setSkills({
            ...defaultSkills,
            ...(data.content || data),
          });
        }

        if (contactResponse.ok) {
          const data = await contactResponse.json();

          setContact({
            ...defaultContact,
            ...(data.content || data),
          });
        }

        if (projectsResponse.ok) {
          const data = await projectsResponse.json();

          setProjects(
            Array.isArray(data)
              ? data
              : data.projects || []
          );
        }

        if (!heroResponse.ok) {
          console.error("Hero request failed");
        }

        if (!aboutResponse.ok) {
          console.error("About request failed");
        }

        if (!skillsResponse.ok) {
          console.error("Skills request failed");
        }

        if (!contactResponse.ok) {
          console.error("Contact request failed");
        }

        if (!projectsResponse.ok) {
          console.error("Projects request failed");
        }

      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      } finally {
        setHeroLoading(false);
        setAboutLoading(false);
        setSkillsLoading(false);
        setContactLoading(false);
        setProjectsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Load messages independently so unrelated CMS failures cannot hide the inbox.
  useEffect(() => {
    if (!token || deletingMessage !== null) return;
    const controller = new AbortController();
    async function loadMessages() {
      setMessagesLoading(true);
      setMessagesError("");
      try {
        const response = await fetch(`${API_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unable to access messages. Please log out and log in again with your admin account.");
        }
        if (!response.headers.get("content-type")?.includes("application/json")) {
          throw new Error(`The message API returned an unexpected response (HTTP ${response.status}). Check the connected backend.`);
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load messages.");
        const inbox = Array.isArray(data) ? data : data.messages;
        if (!Array.isArray(inbox)) throw new Error("The message API returned an invalid message list.");
        if (!controller.signal.aborted) setMessages(inbox);
      } catch (err) {
        if (!controller.signal.aborted) setMessagesError(err.message);
      } finally {
        if (!controller.signal.aborted) setMessagesLoading(false);
      }
    }
    loadMessages();
    return () => controller.abort();
  }, [token, messagesRefresh, activePage, deletingMessage]);

  useEffect(() => {
    const refresh = () => setMessagesRefresh((value) => value + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  /* =========================
     HERO HANDLERS
  ========================= */

  const handleHeroFieldChange = (field, value) => {
    setHero((prev) => ({
      ...prev,
      [field]: value,
    }));

    setHeroMessage("");
  };

  const handleHeroSave = async () => {
    setSavingHero(true);
    setHeroMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/content/hero`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hero),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save Hero content."
        );
      }

      setHero((current) =>
        applySavedContent(
          current,
          hero,
          normalizeHero(data.content ?? hero)
        )
      );

      setHeroMessage(
        "Hero content saved successfully."
      );
    } catch (err) {
      setHeroMessage(
        err.message || "Failed to save Hero content."
      );
    } finally {
      setSavingHero(false);
    }
  };

  /* =========================
     ABOUT HANDLERS
  ========================= */

  const handleAboutFieldChange = (field, value) => {
    setAbout((prev) => ({
      ...prev,
      [field]: value,
    }));

    setAboutMessage("");
  };

  const handleCardChange = (index, field, value) => {
    setAbout((prev) => ({
      ...prev,
      cards: (prev.cards || []).map(
        (card, cardIndex) =>
          cardIndex === index
            ? {
                ...card,
                [field]: value,
              }
            : card
      ),
    }));

    setAboutMessage("");
  };

  const addCard = () => {
    setAbout((prev) => ({
      ...prev,
      cards: [
        ...(prev.cards || []),
        {
          icon: "",
          title: "New Card",
          description: "Add your card description.",
        },
      ],
    }));

    setEditingCard(
      (about.cards || []).length
    );
  };

  const deleteCard = (index) => {
    setAbout((prev) => ({
      ...prev,
      cards: (prev.cards || []).filter(
        (_, cardIndex) => cardIndex !== index
      ),
    }));

    setEditingCard(null);
    setAboutMessage("");
  };

  const handleAboutSave = async () => {
    setSavingAbout(true);
    setAboutMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/content/about`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(about),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save About content."
        );
      }

      setAbout((current) =>
        applySavedContent(
          current,
          about,
          data.content ?? about
        )
      );

      setAboutMessage(
        "About content saved successfully."
      );
    } catch (err) {
      setAboutMessage(
        err.message || "Failed to save About content."
      );
    } finally {
      setSavingAbout(false);
    }
  };

  /* =========================
     SKILLS HANDLERS
  ========================= */

  const handleSkillsFieldChange = (field, value) => {
    setSkills((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSkillsMessage("");
  };

  const handleSkillGroupChange = (
    groupIndex,
    field,
    value
  ) => {
    setSkills((prev) => ({
      ...prev,
      groups: (prev.groups || []).map(
        (group, index) =>
          index === groupIndex
            ? {
                ...group,
                [field]: value,
              }
            : group
      ),
    }));

    setSkillsMessage("");
  };

  const handleSkillChange = (
    groupIndex,
    skillIndex,
    field,
    value
  ) => {
    setSkills((prev) => ({
      ...prev,
      groups: (prev.groups || []).map(
        (group, currentGroupIndex) =>
          currentGroupIndex === groupIndex
            ? {
                ...group,
                skills: (group.skills || []).map(
                  (skill, currentSkillIndex) =>
                    currentSkillIndex === skillIndex
                      ? {
                          ...skill,
                          [field]: value,
                        }
                      : skill
                ),
              }
            : group
      ),
    }));

    setSkillsMessage("");
  };

  const addSkill = (groupIndex) => {
    setSkills((prev) => ({
      ...prev,
      groups: (prev.groups || []).map(
        (group, index) =>
          index === groupIndex
            ? {
                ...group,
                skills: [
                  ...(group.skills || []),
                  {
                    name: "New Skill",
                    logo: "JS",
                    tag: "New Skill",
                    description:
                      "Describe this skill...",
                  },
                ],
              }
            : group
      ),
    }));

    setEditingSkill({
      groupIndex,
      skillIndex:
        (skills.groups?.[groupIndex]?.skills || [])
          .length,
    });
  };

  const deleteSkill = (
    groupIndex,
    skillIndex
  ) => {
    setSkills((prev) => ({
      ...prev,
      groups: (prev.groups || []).map(
        (group, index) =>
          index === groupIndex
            ? {
                ...group,
                skills: (group.skills || []).filter(
                  (_, currentSkillIndex) =>
                    currentSkillIndex !== skillIndex
                ),
              }
            : group
      ),
    }));

    setEditingSkill(null);
    setSkillsMessage("");
  };

  const addSkillGroup = () => {
    setSkills((prev) => ({
      ...prev,
      groups: [
        ...(prev.groups || []),
        {
          id: `skills-${Date.now()}`,
          label: "NEW CATEGORY",
          number: `${String(
            (prev.groups || []).length + 1
          ).padStart(2, "0")} / ${String(
            (prev.groups || []).length + 1
          ).padStart(2, "0")}`,
          skills: [],
        },
      ],
    }));
  };

  const deleteSkillGroup = (groupIndex) => {
    setSkills((prev) => ({
      ...prev,
      groups: (prev.groups || []).filter(
        (_, index) => index !== groupIndex
      ),
    }));

    setEditingGroup(null);
    setEditingSkill(null);
    setSkillsMessage("");
  };

  const handleSkillsSave = async () => {
    setSavingSkills(true);
    setSkillsMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/content/skills`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(skills),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save Skills content."
        );
      }

      setSkills((current) =>
        applySavedContent(
          current,
          skills,
          data.content ?? skills
        )
      );

      setSkillsMessage(
        "Skills content saved successfully."
      );
    } catch (err) {
      setSkillsMessage(
        err.message ||
          "Failed to save Skills content."
      );
    } finally {
      setSavingSkills(false);
    }
  };

  /* =========================
     CONTACT HANDLERS
  ========================= */

  const handleContactFieldChange = (
    field,
    value
  ) => {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }));

    setContactMessage("");
  };

  const handleContactSave = async () => {
    setSavingContact(true);
    setContactMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/content/contact`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contact),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save Contact content."
        );
      }

      setContact((current) =>
        applySavedContent(
          current,
          contact,
          data.content ?? contact
        )
      );

      setContactMessage(
        "Contact content saved successfully."
      );
    } catch (err) {
      setContactMessage(
        err.message ||
          "Failed to save Contact content."
      );
    } finally {
      setSavingContact(false);
    }
  };

  /* =========================
     PROJECT HANDLERS
  ========================= */

  const openAddProject = () => {
    setEditingProject(null);

    setProjectForm({
      ...emptyProject,
      technologies: [],
    });

    setTechnologyInput("");
    setProjectMessage("");
    setProjectEditorOpen(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);

    setProjectForm({
      number: project.number || "",
      name: project.name || "",
      type: project.type || "",
      image: project.image || "",
      description: project.description || "",
      technologies: Array.isArray(
        project.technologies
      )
        ? project.technologies
        : [],
      url: project.url || "",
      isPublished:
        project.is_published !== undefined
          ? project.is_published
          : true,
    });

    setTechnologyInput("");
    setProjectMessage("");
    setProjectEditorOpen(true);
  };

  const closeProjectEditor = () => {
    setProjectEditorOpen(false);
    setEditingProject(null);

    setProjectForm({
      ...emptyProject,
      technologies: [],
    });

    setTechnologyInput("");
    setProjectMessage("");
  };

  const handleProjectChange = (
    field,
    value
  ) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setProjectMessage("");
  };

  const addTechnology = () => {
    const technology =
      technologyInput.trim();

    if (!technology) return;

    if (
      projectForm.technologies.some(
        (item) =>
          item.toLowerCase() ===
          technology.toLowerCase()
      )
    ) {
      setTechnologyInput("");
      return;
    }

    setProjectForm((prev) => ({
      ...prev,
      technologies: [
        ...prev.technologies,
        technology,
      ],
    }));

    setTechnologyInput("");
  };

  const removeTechnology = (index) => {
    setProjectForm((prev) => ({
      ...prev,
      technologies:
        prev.technologies.filter(
          (_, technologyIndex) =>
            technologyIndex !== index
        ),
    }));
  };

  const handleTechnologyKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTechnology();
    }
  };

  const handleProjectSave = async () => {
    if (
      !projectForm.name.trim() ||
      !projectForm.number.trim() ||
      !projectForm.type.trim() ||
      !projectForm.image.trim() ||
      !projectForm.description.trim() ||
      !projectForm.url.trim()
    ) {
      setProjectMessage(
        "Please fill in all required project fields."
      );

      return;
    }

    setSavingProject(true);
    setProjectMessage("");

    try {
      const url = editingProject
        ? `${API_URL}/api/admin/projects/${editingProject.id}`
        : `${API_URL}/api/admin/projects`;

      const method = editingProject
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save project."
        );
      }

      const savedProject =
        data.project || data;

      if (editingProject) {
        setProjects((prev) =>
          prev.map((project) =>
            project.id === editingProject.id
              ? savedProject
              : project
          )
        );

        setProjectMessage(
          "Project updated successfully."
        );
      } else {
        setProjects((prev) => [
          ...prev,
          savedProject,
        ]);

        setProjectMessage(
          "Project added successfully."
        );
      }

      setTimeout(() => {
        closeProjectEditor();
      }, 700);
    } catch (err) {
      setProjectMessage(
        err.message ||
          "Failed to save project."
      );
    } finally {
      setSavingProject(false);
    }
  };

  const deleteProject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setProjectMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete project."
        );
      }

      setProjects((prev) =>
        prev.filter(
          (project) => project.id !== id
        )
      );

      setProjectMessage(
        "Project deleted successfully."
      );
    } catch (err) {
      setProjectMessage(
        err.message ||
          "Failed to delete project."
      );
    }
  };

  const toggleProjectPublished = async (
    project
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/${project.id}`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: project.number,
            name: project.name,
            type: project.type,
            image: project.image,
            description: project.description,
            technologies:
              project.technologies || [],
            url: project.url,
            isPublished:
              !project.is_published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update project."
        );
      }

      const updatedProject =
        data.project || data;

      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id
            ? updatedProject
            : item
        )
      );
    } catch (err) {
      setProjectMessage(
        err.message ||
          "Failed to update project."
      );
    }
  };

  /* =========================
     DASHBOARD HOME
  ========================= */

  const renderDashboardHome = () => {
    const stats = [
      {
        label: "Messages",
        value: messages.length,
        icon: Mail,
      },
      {
        label: "Projects",
        value: projects.length,
        icon: FolderKanban,
      },
      {
        label: "Sections",
        value: 6,
        icon: LayoutDashboard,
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Overview
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Welcome back
            {adminUser?.name
              ? `, ${adminUser.name}`
              : ""}
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your portfolio content from one
            place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="bg-[#101010] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">
                      {stat.label}
                    </p>

                    <p className="text-3xl font-semibold text-white mt-2">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor:
                        "rgba(255,140,0,0.10)",
                      color: ACCENT,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-medium text-white">
                Quick Access
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Quickly edit your website sections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["hero", "Edit Hero", Home],
              ["about", "Edit About", User],
              ["skills", "Edit Skills", Code2],
              [
                "projects",
                "Manage Projects",
                FolderKanban,
              ],
              ["contact", "Edit Contact", Mail],
              ["messages", "View Messages", Mail],
            ].map(([page, label, Icon]) => (
              <button
                key={page}
                onClick={() => selectPage(page)}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/10 text-left text-gray-400 hover:text-white hover:bg-white/5 transition"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,140,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              >
                <Icon size={18} />

                <span className="text-sm">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     HERO EDITOR
  ========================= */

  const renderHeroEditor = () => {
    if (heroLoading) {
      return (
        <div className="text-gray-400">
          Loading Hero content...
        </div>
      );
    }

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Website / Home
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Edit Hero
          </h1>

          <p className="text-gray-400 mt-2">
            Manage the main content displayed on your homepage.
          </p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Hero Information
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Main text and buttons shown in the hero section.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-5">
            {[
              ["Top Label", "topLabel", "01 / HOME"],
              ["Name", "name", "NITISH BAGALE"],
              [
                "Primary Button",
                "primaryButton",
                "VIEW MY WORK",
              ],
              [
                "Secondary Button",
                "secondaryButton",
                "GET IN TOUCH",
              ],
            ].map(([label, field, placeholder]) => (
              <div key={field}>
                <label className="block text-sm text-gray-300 mb-2">
                  {label}
                </label>

                <input
                  type="text"
                  value={hero[field] || ""}
                  onChange={(e) =>
                    handleHeroFieldChange(
                      field,
                      e.target.value
                    )
                  }
                  placeholder={placeholder}
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      ACCENT;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>

              <textarea
                rows="5"
                value={hero.description || ""}
                onChange={(e) =>
                  handleHeroFieldChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Hero description..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              />
            </div>
          </div>
        </div>

        {heroMessage && (
          <div
            className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
              heroMessage.includes("successfully")
                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}
          >
            {heroMessage.includes("successfully") ? (
              <Check size={17} />
            ) : (
              <AlertCircle size={17} />
            )}

            {heroMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleHeroSave}
            disabled={savingHero}
            className="px-6 py-3 rounded-xl disabled:opacity-50 text-white font-medium transition"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            {savingHero ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     ABOUT EDITOR
  ========================= */

  const renderAboutEditor = () => {
    if (aboutLoading) {
      return (
        <div className="text-gray-400">
          Loading About content...
        </div>
      );
    }

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Website / About
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Edit About
          </h1>

          <p className="text-gray-400 mt-2">
            Manage the content displayed in your About
            section.
          </p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Basic Information
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Main text displayed in the About section.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-5">
            {[
              [
                "Top Label",
                "topLabel",
                "02 / ABOUT",
              ],
              [
                "Heading",
                "heading",
                "Turning Ideas Into Digital Experiences.",
              ],
              [
                "Button Text",
                "buttonText",
                "MORE ABOUT ME",
              ],
            ].map(
              ([label, field, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-2">
                    {label}
                  </label>

                  <input
                    type="text"
                    value={about[field] || ""}
                    onChange={(e) =>
                      handleAboutFieldChange(
                        field,
                        e.target.value
                      )
                    }
                    placeholder={placeholder}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        ACCENT;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  />
                </div>
              )
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>

              <textarea
                rows="5"
                value={about.description || ""}
                onChange={(e) =>
                  handleAboutFieldChange(
                    "description",
                    e.target.value
                  )
                }
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                About Cards
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage the cards shown in the About
                section.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-4">
            {(about.cards || []).map(
              (card, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="p-5 bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs shrink-0"
                          style={{
                            backgroundColor:
                              "rgba(255,140,0,0.10)",
                            color: ACCENT,
                          }}
                        >
                          {card.icon || "•"}
                        </span>

                        <div className="min-w-0">
                          <h3 className="text-white font-medium truncate">
                            {card.title ||
                              "Untitled Card"}
                          </h3>

                          <p className="text-gray-500 text-xs mt-1 truncate">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setEditingCard(
                              editingCard === index
                                ? null
                                : index
                            )
                          }
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title="Edit card"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            deleteCard(index)
                          }
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                          title="Delete card"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingCard === index && (
                      <div className="mt-5 pt-5 border-t border-white/10 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Icon
                            </label>

                            <input
                              type="text"
                              value={card.icon || ""}
                              onChange={(e) =>
                                handleCardChange(
                                  index,
                                  "icon",
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  ACCENT;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.1)";
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Title
                            </label>

                            <input
                              type="text"
                              value={card.title || ""}
                              onChange={(e) =>
                                handleCardChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  ACCENT;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.1)";
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Description
                          </label>

                          <textarea
                            rows="4"
                            value={
                              card.description || ""
                            }
                            onChange={(e) =>
                              handleCardChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor =
                                ACCENT;
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.1)";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            <button
              onClick={addCard}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-4 text-gray-400 hover:text-white transition"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,140,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.2)";
              }}
            >
              <Plus size={18} />
              Add Card
            </button>
          </div>
        </div>

        {aboutMessage && (
          <div
            className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
              aboutMessage.includes("successfully")
                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}
          >
            {aboutMessage.includes(
              "successfully"
            ) ? (
              <Check size={17} />
            ) : (
              <AlertCircle size={17} />
            )}

            {aboutMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleAboutSave}
            disabled={savingAbout}
            className="px-6 py-3 rounded-xl disabled:opacity-50 text-white font-medium transition"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            {savingAbout
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     SKILLS EDITOR
  ========================= */

  const renderSkillsEditor = () => {
    if (skillsLoading) {
      return (
        <div className="text-gray-400">
          Loading Skills content...
        </div>
      );
    }

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Website / Skills
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Edit Skills
          </h1>

          <p className="text-gray-400 mt-2">
            Manage the text, categories, and skills shown
            in your Skills section.
          </p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Basic Information
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Main text displayed on the Skills section.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-5">
            {[
              [
                "Top Label",
                "topLabel",
                "03 / SKILLS",
              ],
              [
                "Kicker",
                "kicker",
                "WHAT I WORK WITH",
              ],
              [
                "Heading",
                "heading",
                "Tools & Technologies",
              ],
            ].map(
              ([label, field, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-2">
                    {label}
                  </label>

                  <input
                    type="text"
                    value={skills[field] || ""}
                    onChange={(e) =>
                      handleSkillsFieldChange(
                        field,
                        e.target.value
                      )
                    }
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        ACCENT;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                    placeholder={placeholder}
                  />
                </div>
              )
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>

              <textarea
                rows="5"
                value={skills.description || ""}
                onChange={(e) =>
                  handleSkillsFieldChange(
                    "description",
                    e.target.value
                  )
                }
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
                placeholder="I use modern tools..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Learning Text
              </label>

              <textarea
                rows="3"
                value={skills.learningText || ""}
                onChange={(e) =>
                  handleSkillsFieldChange(
                    "learningText",
                    e.target.value
                  )
                }
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
                placeholder="Always learning, always improving."
              />
            </div>
          </div>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Skill Categories
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage categories and individual skills.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-6">
            {(skills.groups || []).map(
              (group, groupIndex) => (
                <div
                  key={
                    group.id ||
                    groupIndex
                  }
                  className="border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="p-5 bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="font-mono text-sm shrink-0"
                          style={{
                            color: ACCENT,
                          }}
                        >
                          {group.number}
                        </span>

                        <span className="text-white font-medium truncate">
                          {group.label}
                        </span>

                        <span className="text-gray-600 text-sm">
                          (
                          {group.skills?.length ||
                            0}{" "}
                          skills)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setEditingGroup(
                              editingGroup ===
                                groupIndex
                                ? null
                                : groupIndex
                            )
                          }
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title="Edit category"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            deleteSkillGroup(
                              groupIndex
                            )
                          }
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingGroup ===
                      groupIndex && (
                      <div className="mt-5 pt-5 border-t border-white/10 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Category Label
                            </label>

                            <input
                              type="text"
                              value={
                                group.label ||
                                ""
                              }
                              onChange={(e) =>
                                handleSkillGroupChange(
                                  groupIndex,
                                  "label",
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  ACCENT;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.1)";
                              }}
                              placeholder="FRONTEND"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Number
                            </label>

                            <input
                              type="text"
                              value={
                                group.number ||
                                ""
                              }
                              onChange={(e) =>
                                handleSkillGroupChange(
                                  groupIndex,
                                  "number",
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                  ACCENT;
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.1)";
                              }}
                              placeholder="01 / 03"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Section ID
                          </label>

                          <input
                            type="text"
                            value={
                              group.id || ""
                            }
                            onChange={(e) =>
                              handleSkillGroupChange(
                                groupIndex,
                                "id",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor =
                                ACCENT;
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.1)";
                            }}
                            placeholder="skills-frontend"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 border-t border-white/10 space-y-3">
                    {(group.skills || []).map(
                      (skill, skillIndex) => {
                        const isEditing =
                          editingSkill?.groupIndex ===
                            groupIndex &&
                          editingSkill?.skillIndex ===
                            skillIndex;

                        return (
                          <div
                            key={
                              skill.id ||
                              `${groupIndex}-${skillIndex}`
                            }
                            className="border border-white/10 rounded-xl overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-3 p-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                  <span
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium shrink-0"
                                    style={{
                                      backgroundColor:
                                        "rgba(255,140,0,0.10)",
                                      color:
                                        ACCENT,
                                    }}
                                  >
                                    {skill.logo ||
                                      "JS"}
                                  </span>

                                  <div className="min-w-0">
                                    <h4 className="text-white font-medium truncate">
                                      {skill.name}
                                    </h4>

                                    <p className="text-gray-500 text-xs mt-1 truncate">
                                      {skill.tag}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() =>
                                    setEditingSkill(
                                      isEditing
                                        ? null
                                        : {
                                            groupIndex,
                                            skillIndex,
                                          }
                                    )
                                  }
                                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                                  title="Edit skill"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteSkill(
                                      groupIndex,
                                      skillIndex
                                    )
                                  }
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                                  title="Delete skill"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {isEditing && (
                              <div className="border-t border-white/10 p-5 space-y-5 bg-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm text-gray-300 mb-2">
                                      Skill Name
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        skill.name ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleSkillChange(
                                          groupIndex,
                                          skillIndex,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                      onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                          ACCENT;
                                      }}
                                      onBlur={(e) => {
                                        e.currentTarget.style.borderColor =
                                          "rgba(255,255,255,0.1)";
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm text-gray-300 mb-2">
                                      Logo Type
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        skill.logo ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleSkillChange(
                                          groupIndex,
                                          skillIndex,
                                          "logo",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                      onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                          ACCENT;
                                      }}
                                      onBlur={(e) => {
                                        e.currentTarget.style.borderColor =
                                          "rgba(255,255,255,0.1)";
                                      }}
                                      placeholder="react"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-300 mb-2">
                                    Tag
                                  </label>

                                  <input
                                    type="text"
                                    value={
                                      skill.tag ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleSkillChange(
                                        groupIndex,
                                        skillIndex,
                                        "tag",
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor =
                                        ACCENT;
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor =
                                        "rgba(255,255,255,0.1)";
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-300 mb-2">
                                    Description
                                  </label>

                                  <textarea
                                    rows="4"
                                    value={
                                      skill.description ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleSkillChange(
                                        groupIndex,
                                        skillIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor =
                                        ACCENT;
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor =
                                        "rgba(255,255,255,0.1)";
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}

                    <button
                      onClick={() =>
                        addSkill(groupIndex)
                      }
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-3.5 text-gray-400 hover:text-white transition"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,140,0,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.2)";
                      }}
                    >
                      <Plus size={17} />
                      Add Skill
                    </button>
                  </div>
                </div>
              )
            )}

            <button
              onClick={addSkillGroup}
              className="w-full flex items-center justify-center gap-2 border border-dashed rounded-xl py-4 transition"
              style={{
                borderColor:
                  "rgba(255,140,0,0.3)",
                color: ACCENT,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,140,0,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,140,0,0.3)";
              }}
            >
              <Plus size={18} />
              Add Skill Category
            </button>
          </div>
        </div>

        {skillsMessage && (
          <div
            className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
              skillsMessage.includes("successfully")
                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}
          >
            {skillsMessage.includes(
              "successfully"
            ) ? (
              <Check size={17} />
            ) : (
              <AlertCircle size={17} />
            )}

            {skillsMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSkillsSave}
            disabled={savingSkills}
            className="px-6 py-3 rounded-xl disabled:opacity-50 text-white font-medium transition"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            {savingSkills
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     CONTACT EDITOR
  ========================= */

  const renderContactEditor = () => {
    if (contactLoading) {
      return (
        <div className="text-gray-400">
          Loading Contact content...
        </div>
      );
    }

    const basicFields = [
      ["Top Label", "topLabel", "CONTACT"],
      [
        "Heading",
        "heading",
        "Let's build something great.",
      ],
      [
        "Badge",
        "badge",
        "GOOD IDEAS START WITH A HELLO",
      ],
      [
        "Main Title",
        "mainTitle",
        "Your next idea.",
      ],
      [
        "Main Title Accent",
        "mainTitleAccent",
        "Our next conversation.",
      ],
    ];

    const noteFields = [
      [
        "Note Title",
        "noteTitle",
        "A little detail goes a long way.",
      ],
      [
        "Signature",
        "signature",
        "Thoughtful design. Clean code.",
      ],
      [
        "Signature Accent",
        "signatureAccent",
        "A personal touch.",
      ],
    ];

    const formFields = [
      [
        "Form Label",
        "formLabel",
        "LET'S CONNECT",
      ],
      [
        "Form Title",
        "formTitle",
        "Send a message",
      ],
      [
        "Name Label",
        "nameLabel",
        "Your name",
      ],
      [
        "Name Placeholder",
        "namePlaceholder",
        "How should I call you?",
      ],
      [
        "Email Label",
        "emailLabel",
        "Email address",
      ],
      [
        "Email Placeholder",
        "emailPlaceholder",
        "you@example.com",
      ],
      [
        "Message Label",
        "messageLabel",
        "What's on your mind?",
      ],
      [
        "Message Placeholder",
        "messagePlaceholder",
        "Tell me a little about your project...",
      ],
      [
        "Submit Text",
        "submitText",
        "Send message",
      ],
      [
        "Form Hint",
        "formHint",
        "Just a conversation. No commitment required.",
      ],
    ];

    return (
      <div className="max-w-6xl space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Website / Contact
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Edit Contact
          </h1>

          <p className="text-gray-400 mt-2">
            Manage the text displayed in your Contact
            section and contact form.
          </p>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Basic Information
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Main text displayed on the Contact section.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-5">
            {basicFields.map(
              ([label, field, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-2">
                    {label}
                  </label>

                  <input
                    type="text"
                    value={contact[field] || ""}
                    onChange={(e) =>
                      handleContactFieldChange(
                        field,
                        e.target.value
                      )
                    }
                    placeholder={placeholder}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        ACCENT;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }}
                  />
                </div>
              )
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>

              <textarea
                rows="5"
                value={contact.description || ""}
                onChange={(e) =>
                  handleContactFieldChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Contact description..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {noteFields.map(
                ([label, field, placeholder]) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-300 mb-2">
                      {label}
                    </label>

                    <input
                      type="text"
                      value={contact[field] || ""}
                      onChange={(e) =>
                        handleContactFieldChange(
                          field,
                          e.target.value
                        )
                      }
                      placeholder={placeholder}
                      className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          ACCENT;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                    />
                  </div>
                )
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Note Description
              </label>

              <textarea
                rows="4"
                value={
                  contact.noteDescription ||
                  ""
                }
                onChange={(e) =>
                  handleContactFieldChange(
                    "noteDescription",
                    e.target.value
                  )
                }
                placeholder="Share your idea, goals, and timeline..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                Contact Form
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage labels, placeholders, and form
                text.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {formFields.map(
                ([label, field, placeholder]) => (
                  <div
                    key={field}
                    className={
                      field ===
                        "messagePlaceholder" ||
                      field === "formHint"
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    <label className="block text-sm text-gray-300 mb-2">
                      {label}
                    </label>

                    {field ===
                      "messagePlaceholder" ||
                    field === "formHint" ? (
                      <textarea
                        rows={
                          field === "formHint"
                            ? 3
                            : 4
                        }
                        value={
                          contact[field] || ""
                        }
                        onChange={(e) =>
                          handleContactFieldChange(
                            field,
                            e.target.value
                          )
                        }
                        placeholder={placeholder}
                        className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            ACCENT;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.1)";
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={
                          contact[field] || ""
                        }
                        onChange={(e) =>
                          handleContactFieldChange(
                            field,
                            e.target.value
                          )
                        }
                        placeholder={placeholder}
                        className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            ACCENT;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.1)";
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {contactMessage && (
          <div
            className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
              contactMessage.includes("successfully")
                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}
          >
            {contactMessage.includes(
              "successfully"
            ) ? (
              <Check size={17} />
            ) : (
              <AlertCircle size={17} />
            )}

            {contactMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleContactSave}
            disabled={savingContact}
            className="px-6 py-3 rounded-xl disabled:opacity-50 text-white font-medium transition"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            {savingContact
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     PROJECTS EDITOR
  ========================= */

  const renderProjectsEditor = () => {
    if (projectsLoading) {
      return (
        <div className="text-gray-400">
          Loading Projects...
        </div>
      );
    }

    return (
      <div className="max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p
              className="text-sm uppercase tracking-wider mb-2"
              style={{ color: ACCENT }}
            >
              Website / Projects
            </p>

            <h1 className="text-3xl font-semibold text-white">
              Projects
            </h1>

            <p className="text-gray-400 mt-2">
              Manage the projects displayed in your portfolio.
            </p>
          </div>

          {!projectEditorOpen && (
            <button
              onClick={openAddProject}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium transition"
              style={{
                backgroundColor: ACCENT,
              }}
            >
              <Plus size={18} />
              Add Project
            </button>
          )}
        </div>

        <ProjectsContentEditor token={token} />

        {projectEditorOpen && (
          <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: ACCENT }}
                >
                  Project Editor
                </p>

                <h2 className="text-xl font-semibold text-white">
                  {editingProject
                    ? "Edit Project"
                    : "Add Project"}
                </h2>
              </div>

              <button
                onClick={closeProjectEditor}
                className="w-10 h-10 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Project Number
                  </label>

                  <input
                    type="text"
                    value={projectForm.number}
                    onChange={(e) =>
                      handleProjectChange(
                        "number",
                        e.target.value
                      )
                    }
                    placeholder="01"
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Project Type
                  </label>

                  <input
                    type="text"
                    value={projectForm.type}
                    onChange={(e) =>
                      handleProjectChange(
                        "type",
                        e.target.value
                      )
                    }
                    placeholder="TRAVEL"
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Project Name
                </label>

                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) =>
                    handleProjectChange(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Everest Vacation"
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Image URL
                </label>

                <input
                  type="text"
                  value={projectForm.image}
                  onChange={(e) =>
                    handleProjectChange(
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="/images/project.jpg"
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />

                {projectForm.image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Image Preview
                    </p>

                    <img
                      src={projectForm.image}
                      alt="Project preview"
                      className="w-full max-h-72 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={projectForm.description}
                  onChange={(e) =>
                    handleProjectChange(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe your project..."
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Project URL
                </label>

                <input
                  type="text"
                  value={projectForm.url}
                  onChange={(e) =>
                    handleProjectChange(
                      "url",
                      e.target.value
                    )
                  }
                  placeholder="https://example.com/"
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Technologies
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={technologyInput}
                    onChange={(e) =>
                      setTechnologyInput(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleTechnologyKeyDown
                    }
                    placeholder="React"
                    className="flex-1 bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-5 py-3 rounded-xl text-white font-medium"
                    style={{
                      backgroundColor: ACCENT,
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {projectForm.technologies.map(
                    (technology, index) => (
                      <span
                        key={`${technology}-${index}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border"
                        style={{
                          borderColor:
                            "rgba(255,140,0,0.3)",
                          backgroundColor:
                            "rgba(255,140,0,0.08)",
                          color: ACCENT,
                        }}
                      >
                        {technology}

                        <button
                          type="button"
                          onClick={() =>
                            removeTechnology(index)
                          }
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                <div>
                  <p className="text-white font-medium">
                    Published
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    Published projects are visible on your
                    public website.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleProjectChange(
                      "isPublished",
                      !projectForm.isPublished
                    )
                  }
                  className={`relative w-12 h-7 rounded-full transition ${
                    projectForm.isPublished
                      ? ""
                      : "bg-white/10"
                  }`}
                  style={
                    projectForm.isPublished
                      ? {
                          backgroundColor: ACCENT,
                        }
                      : {}
                  }
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                      projectForm.isPublished
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {projectMessage && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 text-red-400 bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={17} />
                  {projectMessage}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProjectEditor}
                  className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProjectSave}
                  disabled={savingProject}
                  className="px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 transition"
                  style={{
                    backgroundColor: ACCENT,
                  }}
                >
                  {savingProject
                    ? "Saving..."
                    : editingProject
                    ? "Update Project"
                    : "Add Project"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!projectEditorOpen &&
          projectMessage && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 text-green-400 bg-green-500/10 border border-green-500/20">
              <Check size={17} />
              {projectMessage}
            </div>
          )}

        {!projectEditorOpen && (
          <>
            {projects.length === 0 ? (
              <div className="bg-[#101010] border border-white/10 rounded-2xl p-10 text-center">
                <FolderKanban
                  size={34}
                  className="mx-auto mb-4"
                  style={{
                    color: ACCENT,
                  }}
                />

                <h3 className="text-white font-medium">
                  No projects yet
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  Add your first project to display it on
                  your portfolio.
                </p>

                <button
                  onClick={openAddProject}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium mt-5"
                  style={{
                    backgroundColor: ACCENT,
                  }}
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden"
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                        <div className="w-full xl:w-48 shrink-0">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-32 xl:h-28 object-cover rounded-xl border border-white/10"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span
                              className="font-mono text-sm"
                              style={{
                                color: ACCENT,
                              }}
                            >
                              {project.number}
                            </span>

                            <span className="text-white font-semibold text-lg">
                              {project.name}
                            </span>

                            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                              {project.type}
                            </span>
                          </div>

                          <p className="text-gray-500 text-sm leading-6">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {Array.isArray(
                              project.technologies
                            ) &&
                              project.technologies.map(
                                (
                                  technology,
                                  index
                                ) => (
                                  <span
                                    key={`${technology}-${index}`}
                                    className="px-2.5 py-1 rounded-lg text-xs border"
                                    style={{
                                      borderColor:
                                        "rgba(255,140,0,0.2)",
                                      backgroundColor:
                                        "rgba(255,140,0,0.05)",
                                      color: ACCENT,
                                    }}
                                  >
                                    {technology}
                                  </span>
                                )
                              )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-3 shrink-0">
                          <button
                            onClick={() =>
                              toggleProjectPublished(
                                project
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition"
                            style={
                              project.is_published
                                ? {
                                    borderColor:
                                      "rgba(34,197,94,0.25)",
                                    backgroundColor:
                                      "rgba(34,197,94,0.08)",
                                    color:
                                      "#4ade80",
                                  }
                                : {
                                    borderColor:
                                      "rgba(255,255,255,0.1)",
                                    backgroundColor:
                                      "rgba(255,255,255,0.03)",
                                    color:
                                      "#6b7280",
                                  }
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                project.is_published
                                  ? "bg-green-400"
                                  : "bg-gray-600"
                              }`}
                            />

                            {project.is_published
                              ? "PUBLISHED"
                              : "UNPUBLISHED"}
                          </button>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                openEditProject(
                                  project
                                )
                              }
                              className="p-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition"
                              title="Edit project"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                deleteProject(
                                  project.id
                                )
                              }
                              className="p-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition"
                              title="Delete project"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* =========================
     MESSAGES PAGE
  ========================= */

  const handleMessageDelete = async (message = null) => {
    if (deletingMessage !== null) return;
    const deleteAll = message === null;
    if (!window.confirm(deleteAll
      ? "Permanently delete all messages? This cannot be undone."
      : `Permanently delete the message from ${message.name}? This cannot be undone.`)) return;

    setDeletingMessage(deleteAll ? "all" : message.id);
    setMessageDeleteError("");
    setMessageDeleteSuccess("");
    try {
      const response = await fetch(
        `${API_URL}/api/messages${deleteAll ? "" : `/${encodeURIComponent(message.id)}`}`,
        { method: "DELETE", headers: authHeaders }
      );
      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session has expired or lacks permission. Please log in again.");
      }
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(response.status === 404 || response.status === 405
          ? "The connected backend does not have the message delete route. Deploy the latest server code to Render, or connect Vite to your updated local backend."
          : `The server returned an unexpected response (HTTP ${response.status}). Please try again shortly.`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete messages.");
      setMessages((current) => deleteAll ? [] : current.filter((item) => item.id !== message.id));
      setMessageDeleteSuccess(data.message);
    } catch (err) {
      setMessageDeleteError(err.message || "Unable to delete messages. Please try again.");
    } finally {
      setDeletingMessage(null);
    }
  };

  const renderMessagesPage = () => {
    return (
      <div className="space-y-8">
        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: ACCENT }}
          >
            Management
          </p>

          <h1 className="text-3xl font-semibold text-white">
            Messages
          </h1>

          <p className="text-gray-400 mt-2">
            Messages received through your website.
          </p>
          <button
            type="button"
            onClick={() => setMessagesRefresh((value) => value + 1)}
            disabled={messagesLoading || deletingMessage !== null}
            className="mt-4 mr-3 inline-flex items-center px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {messagesLoading ? "Refreshing..." : "Refresh messages"}
          </button>
          <button
            type="button"
            onClick={() => handleMessageDelete()}
            disabled={messages.length === 0 || deletingMessage !== null || messagesLoading || Boolean(messagesError)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Trash2 size={16} />
            {deletingMessage === "all" ? "Deleting all..." : "Delete all messages"}
          </button>
        </div>

        {messageDeleteError && <p role="alert" className="text-red-400">{messageDeleteError}</p>}
        {messageDeleteSuccess && <p role="status" className="text-green-400">{messageDeleteSuccess}</p>}
        {messagesError && <p role="alert" className="text-red-400">{messagesError}</p>}

        {messages.length === 0 && (messagesLoading || messagesError) ? (
          messagesLoading ? <p role="status" className="text-gray-400">Loading messages...</p> : null
        ) : messages.length === 0 ? (
          <div className="bg-[#101010] border border-white/10 rounded-2xl p-10 text-center">
            <Mail
              size={32}
              className="text-gray-600 mx-auto mb-4"
            />

            <h3 className="text-white font-medium">
              No messages yet
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Messages submitted through your contact
              form will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-[#101010] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-white font-medium">
                      {message.name}
                    </h3>

                    <p
                      className="text-sm mt-1"
                      style={{
                        color: ACCENT,
                      }}
                    >
                      {message.email}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {message.created_at
                      ? new Date(
                          message.created_at
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>

                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {message.message}
                </p>
                <button
                  type="button"
                  onClick={() => handleMessageDelete(message)}
                  disabled={deletingMessage !== null || messagesLoading}
                  aria-label={`Delete message from ${message.name}`}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Trash2 size={16} />
                  {deletingMessage === message.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* =========================
     PLACEHOLDER
  ========================= */

  const renderPlaceholderPage = ({
  title,
  description,
}) => {
  if (title !== "Settings") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              backgroundColor:
                "rgba(255,140,0,0.10)",
            }}
          >
            <Settings
              size={28}
              style={{
                color: ACCENT,
              }}
            />
          </div>

          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>

          <p className="text-gray-500 mt-2">
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-sm uppercase tracking-wider mb-2"
          style={{ color: ACCENT }}
        >
          Settings
        </p>

        <h1 className="text-3xl font-semibold text-white">
          Website Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your admin account and website information.
        </p>
      </div>

      {/* Admin Account */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white">
            Admin Account
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Your current administrator account.
          </p>
        </div>

        <div className="border-t border-white/10 p-6">
          <label className="block text-sm text-gray-400 mb-2">
            Admin Email
          </label>

          <div className="bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-gray-300">
            {adminUser?.email || "Not available"}
          </div>
        </div>
      </div>

      {/* Website Information */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white">
            Website Information
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Basic information about your portfolio website.
          </p>
        </div>

        <div className="border-t border-white/10 p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Website Name
            </label>

            <input
              type="text"
              defaultValue="Nitish Bagale"
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Website URL
            </label>

            <input
              type="text"
              defaultValue="https://nitishbagale.vercel.app"
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50"
            />
          </div>

          <button
            type="button"
            className="px-5 py-3 rounded-xl text-sm font-medium text-black transition hover:opacity-90"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            Save Website Settings
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white">
            Social Links
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Add your social media profiles.
          </p>
        </div>

        <div className="border-t border-white/10 p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Instagram
            </label>

            <input
              type="text"
              placeholder="https://instagram.com/..."
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              GitHub
            </label>

            <input
              type="text"
              placeholder="https://github.com/..."
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              LinkedIn
            </label>

            <input
              type="text"
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              WhatsApp
            </label>

            <input
              type="text"
              placeholder="WhatsApp number"
              className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-700 outline-none focus:border-orange-500/50"
            />
          </div>

          <button
            type="button"
            className="px-5 py-3 rounded-xl text-sm font-medium text-black transition hover:opacity-90"
            style={{
              backgroundColor: ACCENT,
            }}
          >
            Save Social Links
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#101010] border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-red-400">
            Danger Zone
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Actions related to your current admin session.
          </p>
        </div>

        <div className="border-t border-red-500/10 p-6">
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-3 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

  /* =========================
     RENDER CONTENT
  ========================= */

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return renderDashboardHome();

      case "hero":
        return renderHeroEditor();

      case "about":
        return renderAboutEditor();

      case "skills":
        return renderSkillsEditor();

      case "projects":
        return renderProjectsEditor();

      case "contact":
        return renderContactEditor();

      case "navbar":
      case "footer":
        return (
          <NavigationFooterEditor
            key={activePage}
            section={activePage}
            token={token}
          />
        );

      case "messages":
        return renderMessagesPage();

      case "settings":
        return renderPlaceholderPage({
          title: "Settings",
          description:
            "Dashboard settings will be added here.",
        });

      default:
        return renderDashboardHome();
    }
  };

  /* =========================
     SIDEBAR
  ========================= */

  const renderSidebarContent = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <button
            onClick={() =>
              selectPage("dashboard")
            }
            className="text-left"
          >
            <div className="text-white font-semibold tracking-wide">
              NITISH
              <span style={{ color: ACCENT }}>
                {" "}
                CMS
              </span>
            </div>

            <div className="text-[10px] text-gray-600 tracking-[0.2em] mt-1">
              ADMIN PANEL
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() =>
              selectPage("dashboard")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
              activePage === "dashboard"
                ? "bg-white/5"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            style={
              activePage === "dashboard"
                ? { color: ACCENT }
                : {}
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <div>
            <button
              onClick={() =>
                setWebsiteOpen(!websiteOpen)
              }
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <span className="flex items-center gap-3">
                <Globe size={18} />
                Website
              </span>

              <ChevronDown
                size={16}
                className={`transition ${
                  websiteOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {websiteOpen && (
              <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                {/* HOME - DIRECT BUTTON */}
                <button
                  onClick={() =>
                    selectPage("hero")
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activePage === "hero"
                      ? "bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                  style={
                    activePage === "hero"
                      ? { color: ACCENT }
                      : {}
                  }
                >
                  <Home size={16} />
                  Home
                </button>

                {/* ABOUT - DIRECT BUTTON */}
                <button
                  onClick={() =>
                    selectPage("about")
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activePage === "about"
                      ? "bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                  style={
                    activePage === "about"
                      ? { color: ACCENT }
                      : {}
                  }
                >
                  <User size={16} />
                  About
                </button>

                <button
                  onClick={() =>
                    selectPage("skills")
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activePage === "skills"
                      ? "bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                  style={
                    activePage === "skills"
                      ? { color: ACCENT }
                      : {}
                  }
                >
                  <Code2 size={16} />
                  Skills
                </button>

                <button
                  onClick={() =>
                    selectPage("projects")
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activePage === "projects"
                      ? "bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                  style={
                    activePage === "projects"
                      ? { color: ACCENT }
                      : {}
                  }
                >
                  <FolderKanban size={16} />
                  Projects
                </button>

                <button
                  onClick={() =>
                    selectPage("contact")
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activePage === "contact"
                      ? "bg-white/5"
                      : "text-gray-500 hover:text-white"
                  }`}
                  style={
                    activePage === "contact"
                      ? { color: ACCENT }
                      : {}
                  }
                >
                  <Mail size={16} />
                  Contact
                </button>

                {["navbar", "footer"].map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() =>
                        selectPage(page)
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                        activePage === page
                          ? "bg-white/5"
                          : "text-gray-500 hover:text-white"
                      }`}
                      style={
                        activePage === page
                          ? { color: ACCENT }
                          : {}
                      }
                    >
                      <Menu size={16} />
                      {page === "navbar"
                        ? "Navbar"
                        : "Footer"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="pt-5 mt-5 border-t border-white/10">
            <p className="px-4 mb-2 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
              Management
            </p>

            <button
              onClick={() =>
                selectPage("messages")
              }
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${
                activePage === "messages"
                  ? "bg-white/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              style={
                activePage === "messages"
                  ? { color: ACCENT }
                  : {}
              }
            >
              <span className="flex items-center gap-3">
                <Mail size={18} />
                Messages
              </span>

              {messages.length > 0 && (
                <span
                  className="min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center"
                  style={{
                    backgroundColor:
                      "rgba(255,140,0,0.15)",
                    color: ACCENT,
                  }}
                >
                  {messages.length}
                </span>
              )}
            </button>

            <button
              onClick={() =>
                selectPage("settings")
              }
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                activePage === "settings"
                  ? "bg-white/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              style={
                activePage === "settings"
                  ? { color: ACCENT }
                  : {}
              }
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     MAIN LAYOUT
  ========================= */

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Desktop Sidebar */}

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#0c0c0c] border-r border-white/10 z-40">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header */}

      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0c0c0c] border-b border-white/10 z-50 flex items-center justify-between px-4">
        <button
          onClick={() =>
            selectPage("dashboard")
          }
          className="text-white font-semibold"
        >
          NITISH
          <span style={{ color: ACCENT }}>
            {" "}
            CMS
          </span>
        </button>

        <button
          onClick={() =>
            setMobileMenuOpen(
              !mobileMenuOpen
            )
          }
          className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400"
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </header>

      {/* Mobile Sidebar */}

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside className="relative w-72 h-full bg-[#0c0c0c] border-r border-white/10">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main */}

      <main className="lg:ml-64 min-h-screen">
        <div className="hidden lg:flex h-20 border-b border-white/10 items-center justify-between px-8">
          <div>
            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>

            <p className="text-white font-medium mt-0.5">
              {activePage === "dashboard"
                ? "Overview"
                : activePage === "hero"
                ? "Edit Hero"
                : activePage === "about"
                ? "Edit About"
                : activePage === "skills"
                ? "Edit Skills"
                : activePage === "projects"
                ? "Projects"
                : activePage === "contact"
                ? "Edit Contact"
                : activePage === "messages"
                ? "Messages"
                : activePage === "navbar"
                ? "Edit Navbar"
                : activePage === "footer"
                ? "Edit Footer"
                : "Settings"}
            </p>
          </div>

          <a
            href="https://nitishbagale.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                "rgba(255,140,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                "rgba(255,255,255,0.1)";
            }}
          >
            <Globe size={16} />
            View Website
          </a>
        </div>

        <div className="p-5 md:p-8 lg:p-10 pt-24 lg:pt-10">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
