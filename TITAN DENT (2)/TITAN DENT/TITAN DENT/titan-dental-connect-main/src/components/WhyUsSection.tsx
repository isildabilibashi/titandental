import { motion } from "framer-motion";
import { CheckCircle, Clock, ShieldCheck, Gem, HeartPulse, Users } from "lucide-react";

const reasons = [
  { icon: ShieldCheck, title: "Eksperiencë mbi 13 vjet", desc: "Kemi përvojë të gjatë në ofrimin e kujdesit dentar për pacientë të të gjitha moshave." },
  { icon: Gem, title: "Shërbime të Plota Dentare", desc: "Nga kontrollet rutinë, trajtimet konservative, ortodoncia, protetika dhe kirurgjia dentare, te stomatologjia estetike dhe për fëmijë." },
  { icon: HeartPulse, title: "Profesionalizëm dhe përkushtim", desc: "Stafi ynë i kualifikuar punon me kujdes të veçantë për çdo pacient." },
  { icon: Clock, title: "Teknologji moderne dhe materiale cilësore", desc: "Përdorim pajisje dhe metoda të avancuara për rezultate të sigurta dhe afatgjata." },
  { icon: Users, title: "Ambient mikpritës dhe i qetë", desc: "Vizitat e tua janë të rehatshme dhe pa stres, për një përvojë pozitive." },
];

const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-24 gradient-brown">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Zgjedhja e parë për ju</p>
          <h2 className="text-4xl md:text-5xl font-display text-primary-foreground mb-4">
            Pse pacientët na besojnë buzëqeshjen e tyre?
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto">
            Këtu gjeni arsyet kryesore pse pacientët na zgjedhin për kujdesin dentar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center">
                <Icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-lg text-primary-foreground mb-1">{title}</h3>
                <p className="text-primary-foreground/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
