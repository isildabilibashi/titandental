import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, CalendarDays } from "lucide-react";
import heroImage from "@/assets/klinika.png";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Titan Dental Clinic interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/40" />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gold uppercase tracking-[0.3em] text-sm mb-4"
          >
            Shëndet për dhëmbët, besim për buzëqeshjen.
          </motion.p>
          <h1 className="text-5xl md:text-7xl font-display text-primary-foreground leading-tight mb-6">
            Buzëqeshja juaj, <span className="text-gradient-gold">prioriteti ynë</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-lg leading-relaxed">
            Përjetoni kujdes dentar të nivelit të lartë me teknologji moderne dhe një ekip të përkushtuar për rehati dhe besim.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" })}
              className="gradient-gold text-secondary px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-gold"
            >
              <CalendarDays className="w-5 h-5" />
              Rezervo Online
            </button>
            <a
              href="tel:+1234567890"
              className="border border-gold/40 text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gold/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Telefono Tani
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gold/40 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-gold rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
