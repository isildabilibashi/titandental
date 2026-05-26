import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import erlindPhoto from "../assets/Erlind.png";
import xhensilaPhoto from "../assets/Xhensila.png";

const staff = [
  {
    id: "erlin-kasapi",
    name: "Dr. Erlin Kasapi",
    role: "Stomatolog",
    exp: "13+ vite",
    specialty: "",
    photo: erlindPhoto,
  },
  {
    id: "xhensila-mecuku",
    name: "Dr. Xhensila Mecuku",
    role: "Stomatologe",
    exp: "10+ vite",
    specialty: "",
    photo: xhensilaPhoto,
  },
];

const TeamSection = () => {
  const navigate = useNavigate();

  return (
    <section id="team" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">Stafi Ynë</p>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Njihuni me ekipin tonë
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Në klinikën tonë, buzëqeshja juaj është në duar të sigurta. Stafi ynë i kualifikuar ndërthur përvojën shumëvjeçare me përkushtimin maksimal për çdo pacient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-center max-w-4xl mx-auto">
          {staff.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => navigate(`/doctor/${item.id}`)}
            >
              <div className="w-72 aspect-[3/4] rounded-xl overflow-hidden mb-4 gradient-brown relative shadow-lg transition-transform duration-300 group-hover:scale-105 mx-auto">
                {/* experience badge */}
                <div className="absolute top-4 right-4 bg-gold/90 text-secondary text-xs px-2 py-1 rounded-full z-20">
                  {item.exp}
                </div>
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-gold/30 flex items-center justify-center">
                      <span className="font-display text-2xl text-gold">
                        {item.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-secondary/90 to-transparent p-5 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-display text-lg text-primary-foreground truncate">{item.name}</p>
                  <p className="text-gold text-sm truncate">{item.role}</p>
                  <p className="text-primary-foreground/70 text-xs mt-1 truncate">{item.specialty}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
