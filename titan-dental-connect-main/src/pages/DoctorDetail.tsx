import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import erlindPhoto from "../assets/Erlind.png";
import xhensilaPhoto from "../assets/Xhensila.png";

const staff = [
  {
    id: "erlin-kasapi",
    name: "Dr. Erlin Kasapi",
    role: "Stomatolog",
    exp: "13+ vite",
    specialty: "Mjek Stomatolog, Ortodont",
    photo: erlindPhoto,
    description: "Me mbi 14 vite eksperiencë, Dr. Erlin Kasapi është i specializuar në ortodonci dhe i trajnuar në implantologji të avancuar. Ka përfunduar studimet në Albanian University në vitin 2012. I orientuar drejt ekselencës, ai aplikon teknologji dhe protokolle bashkëkohore për të arritur rezultate funksionale dhe estetike në standardet më të larta.",
  },
  {
    id: "xhensila-mecuku",
    name: "Dr. Xhensila Mecuku",
    role: "Stomatologe",
    exp: "10+ vite",
    specialty: "Mjeke Stomatologe",
    photo: xhensilaPhoto,
    description: "Me mbi një dekadë eksperiencë, Dr. Xhensila Mecuku ofron kujdes dentar të nivelit të lartë, duke ndërthurur precizionin klinik me estetikën moderne. Ka përfunduar studimet në Universitetin e Mjekësisë Dentare në vitin 2015. Përkushtimi ndaj detajit dhe mirëqenies së pacientit garanton rezultate të rafinuara dhe të qëndrueshme.",
  },
];

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = staff.find((d) => d.id === id);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl text-foreground mb-4">Mjeku nuk u gjet</h1>
        <Button onClick={() => navigate("/")} variant="default">
          Kthehu në faqe kryesore
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/#team", { replace: true })}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kthehu
        </Button>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-gold uppercase tracking-[0.2em] text-sm mb-2">
                {doctor.role}
              </p>
              <h1 className="text-4xl md:text-5xl font-display text-foreground">
                {doctor.name}
              </h1>
              <p className="text-gold mt-2 font-medium">{doctor.exp} përvojë</p>
            </div>

            <div className="border-l-2 border-gold pl-4">
              <p className="text-muted-foreground italic">{doctor.specialty}</p>
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-display text-foreground mb-3">
                Rreth Mjekut
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {doctor.description}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;