import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import "./Footer.css";

const links = ["Home", "About", "Skills", "Projects", "Contact"];

// Contact details shared by the portfolio owner.
const contact = {
  email: "nitishbagale@gmail.com",
  whatsapp: "+977 9803817705",
  location: "Banasthali, Kharibot",
};

export default function Footer() {
  const whatsappUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-contact-details">
            <h2 className="footer-label">GET IN TOUCH</h2>
            <div className="footer-details">
              <div className="footer-detail">
                <Mail size={17} aria-hidden="true" />
                <div>
                  <span className="footer-detail-label">EMAIL</span>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  ) : (
                    <span className="footer-placeholder">
                      Email coming soon
                    </span>
                  )}
                </div>
              </div>
              <div className="footer-detail">
                <MessageCircle size={17} aria-hidden="true" />
                <div>
                  <span className="footer-detail-label">WHATSAPP</span>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contact.whatsapp}
                    </a>
                  ) : (
                    <span className="footer-placeholder">
                      Number coming soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <nav className="footer-navigation" aria-label="Footer navigation">
            <h2 className="footer-label">SECTIONS</h2>
            <div className="footer-links">
              {links.map((label) => (
                <a href={`#${label.toLowerCase()}`} key={label}>
                  {label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </nav>

          <div className="footer-location">
            <h2 className="footer-label">LOCATION</h2>
            <div className="footer-location-art" aria-hidden="true">
              <span className="footer-location-ring" />
              <MapPin size={28} strokeWidth={1.5} />
            </div>
            <p className="footer-location-name">
              {contact.location || "Location coming soon"}
            </p>
            <p className="footer-location-note">
              Great ideas can start anywhere.
            </p>
          </div>

          <div className="footer-invitation">
            <h2 className="footer-label">LET'S CONNECT</h2>
            <MessageCircle
              className="footer-chat-icon"
              size={28}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h3>
              Have an idea?
              <br />
              <span>Let's talk.</span>
            </h3>
            <p>Start a conversation about your next project.</p>
            {whatsappUrl ? (
              <a
                className="footer-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <>
                <span className="footer-whatsapp footer-whatsapp-pending">
                  WhatsApp coming soon
                </span>
                <a className="footer-contact-fallback" href="#contact">
                  Send a message instead{" "}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          <span className="footer-credit">
            Made with care. Built with purpose.
          </span>
          <a className="footer-back-top" href="#home">
            Back to top
            <span>
              <ArrowUp size={17} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
