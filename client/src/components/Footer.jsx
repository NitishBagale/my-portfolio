import defaults from "../data/navigation-footer.json";
import { usePublicContent } from "../hooks/usePublicContent";
import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const content = usePublicContent("footer", defaults.footer);
  const contact = content;
  const links = content.links;

  const whatsappUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          {/* Contact */}
          <div className="footer-contact-details">
            <h2 className="footer-label">
              {content.contactHeading}
            </h2>

            <div className="footer-details">
              <div className="footer-detail">
                <Mail size={17} aria-hidden="true" />

                <div>
                  <span className="footer-detail-label">
                    {content.emailLabel}
                  </span>

                  {contact.email ? (
                    <a href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                  ) : (
                    <span className="footer-placeholder">
                      {content.emailPlaceholder}
                    </span>
                  )}
                </div>
              </div>

              <div className="footer-detail">
                <MessageCircle
                  size={17}
                  aria-hidden="true"
                />

                <div>
                  <span className="footer-detail-label">
                    {content.whatsappLabel}
                  </span>

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
                      {content.phonePlaceholder}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="footer-navigation"
            aria-label={content.navigationLabel}
          >
            <h2 className="footer-label">
              {content.sectionsHeading}
            </h2>

            <div className="footer-links">
              {links.map(({ label, href }, index) => (
                <a
                  href={href}
                  key={`${href}-${index}`}
                >
                  {label}

                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </nav>

          {/* Location */}
          <div className="footer-location">
            <h2 className="footer-label">
              {content.locationHeading}
            </h2>

            <a
              className="footer-map"
              href="https://www.google.com/maps/search/?api=1&query=Kathmandu%2C+Nepal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Kathmandu, Nepal in Google Maps"
            >
              <div className="footer-map-grid">
                <span className="footer-map-road footer-map-road-1" />
                <span className="footer-map-road footer-map-road-2" />
                <span className="footer-map-road footer-map-road-3" />
                <span className="footer-map-road footer-map-road-4" />

                <span className="footer-map-pin">
                  <MapPin
                    size={20}
                    strokeWidth={1.8}
                  />
                </span>

                <span className="footer-map-label">
                  KATHMANDU
                </span>
              </div>
            </a>

            <p className="footer-location-name">
              {contact.location ||
                content.locationPlaceholder}
            </p>

            <p className="footer-location-note">
              {content.locationNote}
            </p>
          </div>

          {/* Invitation */}
          <div className="footer-invitation">
            <h2 className="footer-label">
              {content.connectHeading}
            </h2>

            <MessageCircle
              className="footer-chat-icon"
              size={28}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <h3>
              {content.invitationTitle}
              <br />
              <span>
                {content.invitationAccent}
              </span>
            </h3>

            <p>
              {content.invitationDescription}
            </p>

            {whatsappUrl ? (
              <a
                className="footer-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.whatsappButton}{" "}
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </a>
            ) : (
              <>
                <span className="footer-whatsapp footer-whatsapp-pending">
                  {content.whatsappPlaceholder}
                </span>

                <a
                  className="footer-contact-fallback"
                  href={content.fallbackUrl}
                >
                  {content.fallbackText}{" "}
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                  />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {content.copyrightText}
          </p>

          <span className="footer-credit">
            {content.credit}
          </span>

          <a
            className="footer-back-top"
            href={content.backToTopUrl}
          >
            {content.backToTopText}

            <span>
              <ArrowUp
                size={17}
                aria-hidden="true"
              />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}