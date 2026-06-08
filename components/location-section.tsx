"use client"

import { Car, ArrowUpRight } from "lucide-react"
import { distances } from "@/data/data"

export function LocationSection() {
  return (
    <section className="bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Nuestra Ubicación
          </p>

          {/* Capa emocional — 1 frase, tono editorial */}
          <p className="mx-auto mt-8 max-w-2xl text-balance text-xl font-light leading-relaxed text-foreground sm:text-2xl">
            Salas es la puerta de entrada a la Asturias más auténtica: costa,
            montaña y bosque a menos de una hora.
          </p>

          {/* Capa funcional — datos decisoriales */}
          <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-light text-muted-foreground">
            <span>AS-214 directa</span>
            <span className="text-border">·</span>
            <span>Acceso A-8 en 20 min</span>
            <span className="text-border">·</span>
            <span>Aeropuerto OVD a 45 min</span>
          </div>
        </div>

        {/* Mapa — anchor visual equilibrado */}
        <div className="mt-12 overflow-hidden rounded-2xl shadow-soft ring-1 ring-border/20">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11593.968139033115!2d-6.2717442068073375!3d43.408545526274054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd36b0c02b39ba35%3A0xdf8f43e90539c195!2sSalas%2C%2033860%20Salas%2C%20Asturias!5e0!3m2!1ses!2ses!4v1779984320007!5m2!1ses!2ses"
            width="100%"
            height="250"
            className="block w-full sm:h-[300px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Villa Camila en Salas, Asturias"
          />
        </div>

        {/* Tarjetas "Plan de viaje" */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {distances.map((item) => (
            <div
              key={item.place}
              className="card-reveal group flex flex-col rounded-2xl bg-secondary/40 p-5 shadow-soft"
            >
              <div className="flex items-baseline justify-between">
                <p className="font-montserrat text-base font-semibold text-foreground">
                  {item.place}
                </p>
                <span className="text-sm font-semibold text-primary">
                  {item.time}
                </span>
              </div>

              <p className="mt-2 flex-1 text-xs font-light leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <a
                href={item.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                Cómo llegar
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
