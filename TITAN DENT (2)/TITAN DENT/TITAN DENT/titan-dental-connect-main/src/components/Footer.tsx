import { Phone, MapPin, Mail, Clock, Link } from "lucide-react";

const Footer = () => {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="gradient-brown py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-display text-2xl text-primary-foreground mb-4">
              TITAN <span className="text-gold">DENT</span>
            </h3>
            <p className="text-primary-foreground/50 text-sm leading-relaxed">
              Përkushtim maksimal për rehatinë tuaj dhe një buzëqeshje të përsosur.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-primary-foreground mb-4">Kontakt</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60">
              <a href="tel:+355692715929" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" /> +355 69 271 5929
              </a>
              <a href="mailto:info@titandental.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" /> info@titandental.com
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Rruga 3 Dëshmorët, ngjitur Bar Flavio, Kati i dytë, 1000 Tiranë, Albania
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg text-primary-foreground mb-4">Oraret</h4>
            <div className="space-y-2 text-sm text-primary-foreground/60">
              <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> E hënë – E premte: 08:30 – 13:00 dhe 15:00 - 19:30</p>
              <p className="ml-6">E shtunë: 08:30 – 13:00</p>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg text-primary-foreground mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" /> Link
            </h4>
            <div className="space-y-2 text-sm">
              {["About", "Services", "Team", "Reservation"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll(link.toLowerCase());
                  }}
                  className="block text-primary-foreground/60 hover:text-gold transition-colors cursor-pointer"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h4 className="font-display text-lg text-primary-foreground mb-4 text-center">Lokacioni</h4>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.3113722233093!2d19.7801287!3d41.3238421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13503034e0711dc9%3A0x5451d1849a120d08!2sTitan%20Dent!5e0!3m2!1sen!2s!4v1776703146286!5m2!1sen!2s" 
            className="w-full h-[450px] border-0 rounded-lg"
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Titan Dent Location"
          />
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © 2026 Titan Dental Clinic. All rights reserved.
            Powered by Isilda Bilibashi.
          </p>
          <a
            href="/admin-login"
            className="inline-block text-primary-foreground/30 hover:text-gold text-xs mt-3 transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
