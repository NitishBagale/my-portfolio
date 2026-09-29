-- Run against the same PostgreSQL database used by the backend.
-- Existing Navbar/Footer edits are preserved if this migration is rerun.
BEGIN;
INSERT INTO site_content (section, content)
VALUES
('navbar', $cms${
  "ariaLabel": "Main navigation",
  "links": [
    {
      "label": "Home",
      "href": "#home"
    },
    {
      "label": "About",
      "href": "#about"
    },
    {
      "label": "Skills",
      "href": "#skills"
    },
    {
      "label": "Projects",
      "href": "#projects"
    },
    {
      "label": "Contact",
      "href": "#contact"
    }
  ]
}$cms$::jsonb),
('footer', $cms${
  "contactHeading": "GET IN TOUCH",
  "emailLabel": "EMAIL",
  "email": "nitishbagale@gmail.com",
  "emailPlaceholder": "Email coming soon",
  "whatsappLabel": "WHATSAPP",
  "whatsapp": "+977 9803817705",
  "phonePlaceholder": "Number coming soon",
  "sectionsHeading": "SECTIONS",
  "navigationLabel": "Footer navigation",
  "links": [
    {
      "label": "Home",
      "href": "#home"
    },
    {
      "label": "About",
      "href": "#about"
    },
    {
      "label": "Skills",
      "href": "#skills"
    },
    {
      "label": "Projects",
      "href": "#projects"
    },
    {
      "label": "Contact",
      "href": "#contact"
    }
  ],
  "locationHeading": "LOCATION",
  "location": "Banasthali, Kharibot",
  "locationPlaceholder": "Location coming soon",
  "locationNote": "Great ideas can start anywhere.",
  "connectHeading": "LET'S CONNECT",
  "invitationTitle": "Have an idea?",
  "invitationAccent": "Let's talk.",
  "invitationDescription": "Start a conversation about your next project.",
  "whatsappButton": "Chat on WhatsApp",
  "whatsappPlaceholder": "WhatsApp coming soon",
  "fallbackText": "Send a message instead",
  "fallbackUrl": "#contact",
  "copyrightText": "All rights reserved.",
  "credit": "Made with care. Built with purpose.",
  "backToTopText": "Back to top",
  "backToTopUrl": "#home"
}$cms$::jsonb)
ON CONFLICT (section) DO NOTHING;
COMMIT;
