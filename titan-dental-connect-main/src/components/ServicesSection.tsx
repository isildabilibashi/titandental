import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Terapi (Trajtimet Dentare)",
    desc: "• Mbushje grada 1 (silante)\n• Mbushje grada 2 (pa heqje nervi)\n• Pastrime gurezash\n• Zbardhime profesional dhembesh"
  },
  {
    icon: Sparkles,
    title: "Endodonti",
    desc: "• Mbushje grada 3 (me heqje nervi)\n• Mbushje grada 3 (me shumë rrenjë)\n• Mbushje grada 4 (me infeksion)"
  },
  {
    icon: Sparkles,
    title: "Ortodonci",
    desc: "• Maskerina transparente\n• Aparat ortodontik\n• Aparat i lëvizshëm ortodontik"
  },
  {
    icon: Sparkles,
    title: "Kirurgji",
    desc: "• Heqje dhembi\n• Heqje dhemballe pjekurie (8)\n• Heqje e vështirë dhemballe\n• Implante"
  },
  {
    icon: Sparkles,
    title: "Protetike",
    desc: "• Ura porcelani (1 element)\n• Faseta kompositi\n• Ura zirkoni (1 element)\n• E-max (full qemarik)\n• Proteza totale\n• Proteza skeletuara & atashment\n• Proteza elastike totale"
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-cream-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Shërbimet Tona</p>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Gama jonë e shërbimeve dentare
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nga kontrollet rutinë e deri tek ndërhyrjet më komplekse, TITAN DENT ofron një gamë të plotë shërbimesh që mbulojnë çdo nevojë për shëndetin dhe estetikën e buzëqeshjes suaj.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-background rounded-xl p-8 border border-border hover:border-gold/40 transition-all duration-300 hover:shadow-gold"
            >
              <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
               <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
