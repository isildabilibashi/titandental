import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Efi C.", text: "Shume e kenaqur me sherbimin e tyre. Pasterti dhe cilesi. Patjeter qe do rikthehem perseri dhe e rekomandoj per te gjithe.", rating: 5 },
  { name: "David L.", text: "Klinika me e mire ne Tirane per mendimin tim. Dr. Xhensila eshte super profesioniste dhe shume e duruar, sidomos me ne qe jemi pak paciente te veshtire. Cmimet jane shume korrekte per cilesine qe ofrojne. Jam shume i kenaqur me punimet qe kam bere.", rating: 5 },
  { name: "Elona S.", text: "Kam pasur gjithmone tmerr nga dentisti, po te Titan Dent ndryshoi çdo gje. Dr. Erlin eshte shume i qete dhe ta shpjegon çdo gje me detaje. Nuk ndjeva asgje gjate nderhyrjes. Pastertia 10 me yll! Faleminderit shume doktorit dhe gjithe stafit.", rating: 5 },
  { name: "Sidorela K.", text: "Erdha me cunin qe kishte shume frike, po Dr. Xhensila e beri te ndihej si ne loje. Shpetuam vertet se nuk e mbante njeri ne klinika te tjera. Ambient shume modern dhe mikprites. E rekomandoj me gjithe zemer per prinderit!", rating: 5 },
];

const ReviewsSection = () => {
  return (
    <section id="reviews" className="py-24 bg-cream-dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">REVIEWS</p>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Përshtypje nga pacientët tanë 
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map(({ name, text, rating }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background rounded-xl p-8 border border-border relative"
            >
              <Quote className="w-8 h-8 text-gold/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 italic">"{text}"</p>
              <p className="font-semibold text-foreground">{name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
