"use client";

import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import { Button } from "@/components/ui/button";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer>
      <div className="bg-secondary/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* CTA Zone — Primer bloque visual */}
          <div className="rounded-2xl bg-primary/5 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="font-montserrat text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  ¿Listo para reservar?
                </p>
                <p className="mt-1 text-lg font-light text-foreground">
                  Asegura tu estancia en Villa Camila
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="btn-tactile px-8 py-6 text-base font-semibold"
                >
                  <a
                    href="https://reservas.rentitup.es/search?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reservar ahora
                  </a>
                </Button>
                <a
                  href="https://wa.me/34689575612"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2.5 rounded-xl border border-border/50 px-6 py-3.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                >
                  <WhatsAppIcon/>
                  <span>Escríbenos por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Info Zone — Branding + Contacto */}
          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <img
                  src="/logo.webp"
                  alt="Villa Camila"
                  className="h-8 w-auto"
                />
                <span className="font-great-vibes text-2xl font-light text-foreground">
                  Villa Camila
                </span>
              </div>
              <p className="mx-auto mt-3 max-w-xs text-xs font-light text-muted-foreground/70 lg:mx-0">
                &ldquo;Donde el tiempo encuentra su ritmo natural&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 lg:items-end">
              <a
                href="tel:+34689575612"
                className="group flex items-center gap-3 text-foreground/70 transition-colors hover:text-foreground"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                  <Phone className="size-3.5 text-primary" />
                </span>
                <span className="text-sm font-light">+34 689 57 56 12</span>
              </a>

              <a
                href="https://maps.app.goo.gl/PfyQjrQBBQLdfXN67"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-foreground/70 transition-colors hover:text-foreground"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                  <MapPin className="size-3.5 text-primary" />
                </span>
                <span className="text-sm font-light">Salas, Asturias</span>
              </a>

              <div className="flex items-center gap-3 text-foreground/70">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/5">
                  <Clock className="size-3.5 text-primary" />
                </span>
                <span className="text-sm font-light">
                  Check-in: 16:00 &middot; Check-out: 11:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Zone — Links mínimos */}
      <div className="border-t border-border/30 py-8">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a
                href="#apartamentos"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Apartamentos
              </a>
              <a
                href="#contacto"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contacto
              </a>
            </nav>

            <p className="font-montserrat text-xs text-muted-foreground">
              &copy; {currentYear} Villa Camila Apartamentos. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
