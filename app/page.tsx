"use client";

import {
  Menu,
  MapPin,
  Clock,
  Car,
  Phone,
  Star,
  Trees,
  Waves,
  Utensils,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QueHacerSection } from "@/components/que-hacer-section";
import dynamic from "next/dynamic";
import { SiteFooter } from "@/components/site-footer";
import { FloatingActions } from "@/components/floating-actions";
import { WatercolorDecoration } from "@/components/watercolor-decoration";
import { distances } from "@/data/data";

const ApartamentosSection = dynamic(
  () => import("@/components/apartamentos-section"),
  { ssr: false }
);
const LocationSection = dynamic(
  () => import("@/components/location-section"),
  { ssr: false }
);
const ContactForm = dynamic(
  () => import("@/components/contact-form"),
  { ssr: false }
);

const reviews = [
  {
    name: "María García",
    avatar: "M",
    rating: 5,
    text: "Lugar mágico, perfecto para desconectar. Los apartamentos están impecables y los anfitriones son encantadores.",
    date: "Hace 2 semanas",
  },
  {
    name: "Carlos Fernández",
    avatar: "C",
    rating: 5,
    text: "Repetiremos sin duda. La ubicación es ideal para explorar Asturias occidental. Todo muy limpio y bien equipado.",
    date: "Hace 1 mes",
  },
  {
    name: "Ana Rodríguez",
    avatar: "A",
    rating: 5,
    text: "Una experiencia inolvidable. El entorno es precioso y los apartamentos tienen todo lo necesario. ¡Volveremos!",
    date: "Hace 3 semanas",
  },
];

export default function VillaCamilaPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.location.hash = id;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar - Editorial minimal */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
          <button
            onClick={() => scrollToSection("inicio")}
            className="flex items-center gap-3 text-foreground transition-colors hover:text-primary"
          >
            <img
              src="/logo.webp"
              alt="Villa Camila"
              className="h-15 w-auto sm:h-11"
            />
            <span className="font-great-vibes text-2xl md:text-4xl font-medium">
              Villa Camila
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-10 md:flex">
            {[
              { name: "Inicio", id: "inicio" },
              { name: "Entorno", id: "entorno" },
              { name: "Qué Hacer", id: "que-hacer" },
              { name: "Apartamentos", id: "apartamentos" },
              { name: "Opiniones", id: "opiniones" },
              { name: "Contacto", id: "contacto" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="link-underline text-sm font-medium tracking-wide text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.name}
              </button>
            ))}

            {/* Botón Reservar - Desktop */}
            <Button 
              asChild
              size="sm" 
              className="btn-tactile bg-primary text-primary-foreground font-medium px-5 rounded-full"
            >
              <a href="https://reservas.rentitup.es/search?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio" target="_blank" rel="noreferrer">
                Reservar
              </a>
            </Button>
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="transition-transform hover:scale-105"
              >
                <Menu className="size-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background p-8">
              <SheetHeader>
                <SheetTitle className="font-great-vibes text-3xl font-medium text-foreground">
                  Villa Camila
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-12 flex flex-col gap-6">
                {[
                  { name: "Inicio", id: "inicio" },
                  { name: "Entorno", id: "entorno" },
                  { name: "Qué Hacer", id: "que-hacer" },
                  { name: "Apartamentos", id: "apartamentos" },
                  { name: "Opiniones", id: "opiniones" },
                  { name: "Contacto", id: "contacto" },
                ].map((item) => (
                  <SheetClose asChild key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-left font-montserrat text-xl font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-border/50">
                <SheetClose asChild>
                  <Button 
                    asChild
                    size="lg" 
                    className="btn-tactile w-full bg-primary text-primary-foreground font-medium py-6 text-base rounded-xl"
                  >
                    <a href="https://reservas.rentitup.es/search?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio" target="_blank" rel="noreferrer">
                      Reservar Ahora
                    </a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>
        {/* Hero Section - Editorial with generous whitespace */}
        <section id="inicio" className="relative min-h-[90vh] overflow-hidden">
          <picture className="absolute inset-0">
            <source srcSet="/Exteriores/VC - Ext_006.avif" type="image/avif" />
            <source srcSet="/Exteriores/VC - Ext_006.webp" type="image/webp" />
            <img
              src="/Exteriores/VC - Ext_006.webp"
              alt="Villa Camila Salas Apartamentos — Turismo Rural en Asturias"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10" />
          <div className="relative mx-auto flex min-h-[90vh] max-w-6xl items-center px-6 py-12 lg:px-8">
            <div className="max-w-2xl md:-translate-y-16 transition-transform duration-300">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
                Salas, Asturias
              </p>
              <h1 className="mt-6 font-great-vibes text-5xl font-medium leading-[1.1] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
                Villa Camila Salas Apartamentos
              </h1>
              <p className="mt-20 text-lg font-light leading-relaxed text-primary-foreground/90 sm:text-xl">
                Tu refugio en el corazón de Asturias. Descubre la magia del
                occidente asturiano desde la comodidad de nuestros apartamentos.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("apartamentos")}
                  className="btn-tactile group bg-primary-foreground px-8 py-6 text-base font-medium text-primary hover:bg-primary-foreground"
                >
                  Explorar Apartamentos
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("contacto")}
                  className="btn-tactile border-primary-foreground/40 bg-primary-foreground/10 px-8 py-6 text-base font-medium text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20"
                >
                  Contactar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* El Entorno Section - Editorial layout */}
        <section id="entorno" className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Descubre Salas
              </p>
              <h2 className="mt-4 font-montserrat text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                La Puerta del Occidente
              </h2>
              <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
                <strong>Salas</strong> no es solo un lugar de paso; es el
                secreto mejor guardado para quienes buscan la{" "}
                <strong>Asturias</strong> auténtica. Aquí, el Camino Primitivo
                de Santiago pasa por tu puerta, rodeado de paz, castaños y el
                susurro del río Nonaya. Estamos en el centro de todo: la costa
                virgen de Cudillero, la majestuosidad de Somiedo y la historia
                de Oviedo están a un paso, pero al volver, la tranquilidad de
                nuestro valle te recibirá con los brazos abiertos.
              </p>
            </div>

            {/* Distance cards - Minimal editorial style */}
            <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {distances.map((item) => (
                <div
                  key={item.place}
                  className="card-reveal group rounded-2xl bg-card p-8 shadow-soft"
                  onClick={() => window.open(item.maps, "_blank")}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Car className="size-5 text-primary" />
                  </div>
                  <p className="mt-6 font-montserrat text-2xl font-medium text-foreground">
                    {item.place}
                  </p>
                  <p className="mt-1 text-3xl font-light tracking-tight text-primary">
                    {item.time}
                  </p>
                  <p className="mt-3 text-sm font-light text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature content - Editorial asymmetric layout */}
            <div className="mt-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <div className="img-reveal overflow-hidden rounded-2xl">
                <img
                  src="./Mirador Sablon.webp"
                  alt="Paisaje de Asturias"
                  className="h-[400px] w-full object-cover lg:h-[500px]"
                />
              </div>
              <div>
                <h3 className="text-balance font-sans text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  ¿Qué te espera al salir por la puerta?
                </h3>
                <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
                  Asturias no se ve, se siente. Desde Villa Camila, tienes el
                  privilegio de elegir cada día un paisaje distinto:
                </p>
                <div className="mt-12 space-y-10">
                  {[
                    {
                      icon: Trees,
                      title: "Bosques que susurran",
                      description:
                        "Rutas sencillas para caminar en familia, con tu perro y bajo la sombra de robles centenarios, como la Cascada del Nonaya.",
                    },
                    {
                      icon: Waves,
                      title: "El Cantábrico salvaje",
                      description:
                        "Playas como el Silencio o Gueirúa no son solo arena; son acantilados de postal y atardeceres que recordarás todo el año.",
                    },
                    {
                      icon: Utensils,
                      title: "El sabor de casa",
                      description:
                        "No te vayas sin probar nuestro queso Afuega'l Pitu o el buen cachopo. En Salas, comer es una religión y siempre encontrarás una mesa donde sentirte como en casa.",
                    },
                    {
                      icon: Landmark,
                      title: "Historia viva",
                      description:
                        "Iglesias románicas, palacios medievales y el encanto de pueblos que parecen sacados de una novela.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="group flex gap-5">
                      <span className="flex mt-1 size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                        <item.icon className="size-5 text-primary" />
                      </span>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm font-light leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <WatercolorDecoration direction="right" layout="full" />

        {/* Qué Hacer Section */}
        <QueHacerSection />

        <WatercolorDecoration direction="right" layout="full" />

        <ApartamentosSection />

        <WatercolorDecoration direction="left" layout="full" />

        {/* Opiniones Section - Editorial testimonials */}
        <section id="opiniones" className="py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Lo que dicen nuestros huéspedes
              </p>
              <h2 className="mt-4 font-montserrat text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                Opiniones Verificadas
              </h2>
            </div>

            {/* Google Reviews Widget - Elevated editorial style */}
            <div className="mt-16 rounded-2xl bg-card p-8 shadow-soft sm:p-10">
              <div className="flex flex-col items-center justify-between gap-6 border-b border-border/50 pb-8 sm:flex-row">
                <div className="flex items-center gap-5">
                  <div className="flex size-14 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-12">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Google Reviews
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="size-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-light text-foreground">
                        5.0
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="btn-tactile">
                  Escribir una reseña
                </Button>
              </div>

              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-secondary/30 p-6 transition-all duration-300 hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary text-base font-medium text-primary-foreground">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.date}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="mt-4 font-montserrat text-base italic leading-relaxed text-foreground">
                      {`"${review.text}"`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <WatercolorDecoration direction="right" layout="full" />

        {/* Contacto Section - Editorial with warmth */}
        <section id="contacto" className="bg-primary py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
                  Contacto
                </p>
                <h2 className="mt-4 font-montserrat text-4xl font-medium tracking-tight text-primary-foreground sm:text-5xl">
                  ¿Tienes alguna pregunta?
                </h2>
                <p className="mt-6 text-lg font-light leading-relaxed text-primary-foreground/80">
                  Estamos aquí para ayudarte a planificar tu escapada perfecta.
                  No dudes en contactarnos para cualquier consulta o reserva.
                </p>

                <div className="mt-12 space-y-6">
                  <a
                    href="tel:+34689575612"
                    className="group flex items-center gap-5 text-primary-foreground"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors group-hover:bg-primary-foreground/20">
                      <Phone className="size-5" />
                    </div>
                    <span className="text-xl font-light transition-opacity group-hover:opacity-80">
                      +34 689 57 56 12
                    </span>
                  </a>
                  <div className="flex items-center gap-5 text-primary-foreground">
                    <a
                      href="https://maps.app.goo.gl/PfyQjrQBBQLdfXN67"
                      className="group flex items-center gap-5 text-primary-foreground"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors group-hover:bg-primary-foreground/20">
                        <MapPin className="size-5" />
                      </div>

                       <span className="text-xl font-light transition-opacity group-hover:opacity-80">
                        Salas, Asturias, España
                      </span>
                    </a>
                  </div>
                  <div className="flex items-center gap-5 text-primary-foreground">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/10">
                      <Clock className="size-5" />
                    </div>
                    <span className="text-xl font-light">
                      Check-in: 16:00 | Check-out: 11:00
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-8 shadow-soft-lg sm:p-10">
                <h3 className="font-montserrat text-2xl font-medium text-foreground">
                  Envíanos un mensaje
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <LocationSection />

      <SiteFooter />

      <FloatingActions />
    </div>
  );
}
