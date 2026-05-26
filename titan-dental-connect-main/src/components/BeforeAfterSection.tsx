import { motion } from "framer-motion";
import beforeafter1 from "../assets/beforeafter1.png";
import beforeafter2 from "../assets/beforeafter2.png";
import beforeafter3 from "../assets/beforeafter3.png";

const results = [
  { id: 1, image: beforeafter1 },
  { id: 2, image: beforeafter2 },
  { id: 3, image: beforeafter3 },
];

const BeforeAfterSection = () => {
  return (
    <section id="before-after" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Rezultatet Tona</p>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Pas dhe Para Trajtimit
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Shikoni ndryshimet e jashtëzakonshme te pacientët tanë pas trajtimit dentar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {results.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-secondary shadow-lg"
            >
              <img src={item.image} alt="Rezultati" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;