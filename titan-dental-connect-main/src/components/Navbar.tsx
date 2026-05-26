import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const navLinks = ["About", "Services", "Why Us", "Team", "Reviews", "Reservation", "Emergency"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (id === "Emergency") {
      window.location.hash = "emergency";
    } else if (id === "Reservation") {
      window.location.hash = "reservation";
    } else if (id === "About") {
      window.location.hash = "about";
    } else if (id === "Why Us") {
      window.location.hash = "why-us";
    } else if (id === "Team") {
      window.location.hash = "team";
    } else if (id === "Reviews") {
      window.location.hash = "reviews";
    } else if (id === "Services") {
      window.location.hash = "services";
    }
    setIsOpen(false);
  };

  const handleLogoClick = () => {
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-secondary/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={handleLogoClick} className="font-display text-2xl text-primary-foreground tracking-wide">
          TITAN <span className="text-gold">DENT</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={`text-sm tracking-wider uppercase ${
                link === "Emergency" 
                  ? "text-destructive font-semibold hover:text-destructive/80" 
                  : "text-primary-foreground/80 hover:text-gold transition-colors"
              }`}
            >
              {link}
            </button>
          ))}
          <a
            href="tel:+1234567890"
            className="flex items-center gap-2 gradient-gold text-secondary px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-primary-foreground">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-secondary/95 backdrop-blur-md border-t border-gold/20"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className={`text-left uppercase text-sm tracking-wider ${
                  link === "Emergency"
                    ? "text-destructive font-semibold hover:text-destructive/80"
                    : "text-primary-foreground/80 hover:text-gold transition-colors"
                }`}
              >
                {link}
              </button>
            ))}
            <a href="tel:+1234567890" className="gradient-gold text-secondary px-5 py-2 rounded-full text-sm font-semibold text-center">
              <Phone className="w-4 h-4 inline mr-2" />
              Call Now
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
