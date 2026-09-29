import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BackToTop from "./components/BacktoTop";
import PublicCmsLoader from "./components/PublicCmsLoader";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./layout.css";

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin/login") {
    return <AdminLogin />;
  }

  if (path === "/admin/dashboard") {
    return <AdminDashboard />;
  }

  return (
    <PublicCmsLoader>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </PublicCmsLoader>
  );
}
