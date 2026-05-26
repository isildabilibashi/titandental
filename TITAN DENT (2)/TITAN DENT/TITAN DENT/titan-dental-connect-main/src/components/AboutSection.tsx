import { motion } from "framer-motion";
import { Shield, Award, Heart } from "lucide-react";
import Kolazh from "../assets/kolazh.png";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Rreth Nesh</p>
            <h2 className="text-4xl md:text-5xl font-display text-foreground mb-6">
              Klinika jonë dentare
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Me mbi 13 vite përvojë, klinika jonë dentare ofron kujdes të plotë për të gjitha moshat, duke garantuar trajtime të sigurta, cilësore dhe të personalizuara. Ne ofrojmë të gjitha shërbimet dentare, nga kontrollet rutinë dhe trajtimet konservative, te ortodoncia, protetika, kirurgjia dentare dhe estetika e buzëqeshjes. Ambienti ynë modern dhe mikpritës është krijuar për t'ju siguruar rehati dhe qetësi gjatë çdo vizite.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                  { icon: Shield, label: "Certifikuar", value: "ORTHODONTICS" },
                  { icon: Award, label: "Përvojë", value: "13+ Vite" },
                  { icon: Heart, label: "Pacientë të Kënaqur", value: "15,000+" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="font-semibold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-cream-dark border border-border">
              <div className="w-full h-full gradient-brown flex items-center justify-center relative">
                {/* background collage image inside brown area */}
                <img
                  src={Kolazh}
                  alt="Kolazh"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="text-center p-8 relative z-10">
                  <p className="font-display text-6xl text-gold mb-4">13+</p>
                  <p className="text-primary-foreground/80 text-lg">Vite Ekselence</p>
                  <div className="w-16 h-0.5 gradient-gold mx-auto mt-4" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-xl gradient-gold shadow-gold flex items-center justify-center">
              <div className="text-center">
                <p className="font-display text-3xl text-secondary">4.9</p>
                <p className="text-secondary/80 text-xs">★★★★★</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
