"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Compass, Footprints, Sparkles } from "lucide-react";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WatercolorDecoration } from "@/components/watercolor-decoration";

export function QueHacerSection() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedCamino, setExpandedCamino] = useState(false);

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  const toggleItem = (itemName: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <section id="que-hacer" className="py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-accent sm:text-sm">
            Descubre el Occidente
          </p>
          <h2 className="mt-4 text-balance font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Qué hacer en el Occidente de Asturias
          </h2>
          <p className="mt-6 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Alojarse en Salas tiene un gran truco: estás a un paso de la montaña
            más verde y de las playas más salvajes del Cantábrico. Si no sabes
            por dónde empezar a organizar tus días con nosotros, aquí te dejamos
            nuestros rincones favoritos. Son perfectos para disfrutar en pareja,
            en familia y, por supuesto, con tu mascota.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:mt-16 sm:gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 sm:px-5 sm:py-3",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">
                  {category.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="mt-10 sm:mt-16">
          <h3 className="text-balance text-center font-serif text-2xl font-medium text-foreground sm:text-3xl">
            {currentCategory.title}
          </h3>

          {/* Items Grid */}
          <div className="mt-8 sm:mt-12 space-y-12 md:space-y-16">
            {currentCategory.items.map((item, index) => (
              <div
                key={item.name}
                className={cn(
                  "grid items-center gap-6 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1fr,1.2fr] lg:gap-16",
                  index !== currentCategory.items.length - 1 && "border-b border-border/30",
                )}
              >
                {/* Imagen */}
                <div className="img-reveal overflow-hidden rounded-2xl w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-[4/2.5] w-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-balance font-serif text-xl font-medium text-foreground sm:text-2xl">
                      {item.name}
                    </h4>

                    <div className="mt-3 sm:mt-4">
                      <p
                        className={cn(
                          "text-sm font-light leading-relaxed text-muted-foreground sm:text-base",
                          !expandedItems[item.name] && "line-clamp-3 sm:line-clamp-none",
                        )}
                      >
                        {item.description}
                      </p>

                      <button
                        onClick={() => toggleItem(item.name)}
                        className="mt-2 flex min-h-[44px] items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:hidden"
                      >
                        {expandedItems[item.name] ? "Ver menos" : "Leer más"}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            expandedItems[item.name] && "rotate-180",
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-2 flex flex-wrap gap-3">
                    {item.maps && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="btn-tactile rounded-full border-border px-4 py-2 text-xs font-medium bg-background/100 text-foreground/70 hover:bg-primary/30 hover:text-primary shadow-sm transition-all"
                      >
                        <a href={item.maps} target="_blank" rel="noreferrer">
                          <MapPin className="mr-1.5 size-3.5 text-primary" />
                          Cómo llegar
                        </a>
                      </Button>
                    )}

                    {"wiki" in item && item.wiki && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="btn-tactile rounded-full border-border px-4 py-2 text-xs font-medium bg-background/100 text-foreground/70 hover:bg-primary/30 hover:text-primary  shadow-sm transition-all"
                      >
                        <a href={item.wiki} target="_blank" rel="noreferrer">
                          <Compass className="mr-1.5 size-3.5 text-emerald-600" />
                          Ruta Wikiloc
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>  

        {/* --- SECCIÓN DESTACADA: EL CAMINO PRIMITIVO --- */}
        <div className="mt-24 rounded-3xl border border-border/40 bg-secondary/30 p-6 sm:mt-32 sm:p-10 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,1fr] lg:gap-16 items-center">
            
            {/* Organización de las 3 Fotos (Mosaico Editorial Asimétrico) */}
            <div className="relative grid grid-cols-12 gap-4 auto-rows-max order-last lg:order-first">
              {/* Foto 1: Principal Izquierda */}
              <div className="img-reveal col-span-7 aspect-[5/6] rounded-2xl shadow-soft-lg">
                <img 
                  src="./Cruz-de-Asturias-en-cascada-de-Nonaya.webp" // Cambia por tus rutas reales
                  alt="Peregrino en el Camino Primitivo de Salas" 
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Contenedor derecho para Foto 2 y Foto 3 */}
              <div className="col-span-5 flex flex-col justify-between gap-4">
                {/* Foto 2: Superior Derecha */}
                <div className="img-reveal aspect-square rounded-2xl shadow-soft">
                  <img 
                    src="./Molino-de-Bedures.webp" 
                    alt="Paisaje boscoso río Nonaya" 
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Foto 3: Inferior Derecha (Desplazada ligeramente para dar dinamismo) */}
                <div className="img-reveal aspect-[5/4] rounded-2xl shadow-soft lg:translate-y-4">
                  <img 
                    src="./Salas-Tineo-Camino-de-Santiago.webp"
                     
                    alt="Colegiata de Santa María de Salas" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Contenido de Texto */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-accent">
                <Footprints className="size-5" />
                <span className="text-xs font-medium uppercase tracking-widest sm:text-sm">Ruta Histórica</span>
              </div>
              
              <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl text-balance">
                El Camino Primitivo: la magia jacobea pasa por tu puerta
              </h3>
              
              <div className="mt-6 space-y-4 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Si hay algo que define la atmósfera de Salas es el goteo constante de peregrinos y esa energía única que desprende el Camino de Santiago Primitivo, la ruta jacobea más antigua, auténtica y exigente de todas. Nuestra villa es parada obligatoria: marca el final de la <span className="font-medium text-foreground">Etapa 4 (Grado - Salas)</span> y el emocionante inicio de la <span className="font-medium text-foreground">Etapa 5 (Salas - Tineo)</span>.
                </p>
                <p>
                  Tanto si vienes con la mochila a cuestas buscando un refugio donde aliviar las piernas, como si te alojas con nosotros para hacer turismo y te apetece vivir la experiencia de recorrer un tramo histórico de la ruta, Salas te ofrece el escenario perfecto.
                </p>

                {/* Acordeón / Colapsable en Móvil para no saturar la pantalla */}
                <div className={cn(
                  "space-y-6 pt-2 transition-all duration-300",
                  !expandedCamino && "hidden sm:block"
                )}>
                  <h4 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
                    ¿Qué hace tan especial al Camino Primitivo en Salas?
                  </h4>
                  
                  <ul className="space-y-5 border-l-2 border-primary/20 pl-4">
                    <li>
                      <strong className="font-medium text-foreground block mb-1">Una llegada de postal (Fin de la Etapa 4):</strong> 
                      Tras kilómetros de caminata, el descenso hacia Salas te regala una de las mejores panorámicas del norte. El sendero se abre entre bosques autóctonos de castaños para descubrirte, de golpe, el imponente conjunto medieval de la villa con la Torre de los Valdés al frente.
                    </li>
                    <li>
                      <strong className="font-medium text-foreground block mb-1">El mítico ascenso a La Espina (Inicio de la Etapa 5):</strong> 
                      Desde el mismo centro del pueblo arranca uno de los tramos más bellos y comentados por los peregrinos. Una subida exigente pero mágica que discurre paralela al río Nonaya y su cascada, rodeándote de robles centenarios y musgo.
                    </li>
                    <li>
                      <strong className="font-medium text-foreground block mb-1">Hospitalidad con siglos de historia:</strong> 
                      Salas lleva desde el siglo IX cuidando al viajero. Ese espíritu se nota en sus calles, en la Oficina de Turismo y en la Colegiata de Santa María, donde podrás sellar tu credencial.
                    </li>
                  </ul>

                  {/* Consejo Local destacado */}
                  <div className="rounded-2xl bg-background p-5 border border-border/60 shadow-soft">
                    <p className="text-sm font-normal text-foreground flex items-center gap-2 mb-1.5">
                      <Sparkles className="size-4 text-accent fill-accent/10" />
                      Consejo de local:
                    </p>
                    <p className="text-sm text-muted-foreground font-light">
                      Si te alojas en Villa Camila y no quieres hacer una etapa entera, te recomendamos caminar las dos primeras horas de la Etapa 5 hasta la <span className="font-medium text-primary">Cascada del Nonaya</span>. Disfrutarás de la esencia pura del Camino de Santiago y podrás volver a comer a la villa para descansar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón Leer Más exclusivo de móvil */}
              <button
                onClick={() => setExpandedCamino(!expandedCamino)}
                className="mt-4 flex min-h-[44px] items-center justify-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:hidden border border-primary/20 rounded-full bg-background"
              >
                {expandedCamino ? "Ver menos detalles" : "Leer más sobre el Camino"}
                <ChevronDown className={cn("size-4 transition-transform", expandedCamino && "rotate-180")} />
              </button>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="btn-tactile rounded-full border-border bg-card px-5 py-2.5 text-xs font-medium text-foreground shadow-sm transition-all"
                >
                  <a href="https://es.wikiloc.com/rutas-senderismo/salas-tineo-camino-primitivo-santiago-25001044" target="_blank" rel="noreferrer">
                    <Compass className="mr-1.5 size-4 text-emerald-600" />
                    Wikiloc Etapa 5 (Salas - Tineo)
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}