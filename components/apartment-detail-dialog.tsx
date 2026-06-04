"use client"

import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import {
  Users,
  BedDouble,
  Bath,
  PawPrint,
  Calendar,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Apartment } from "@/data/apartments"
import { amenities, kitchenDetails } from "@/data/apartments"

const MAX_DOTS = 7

// ─── CAROUSEL INTERNO (UNIFICADO Y COMPARTIDO) ───────────────────────────────
interface SharedCarouselProps {
  apartment: Apartment
  isFullscreen: boolean
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  onToggleFullscreen: () => void
  onCloseDialog?: () => void // Callback para cerrar el Dialog completo desde la galería
}

const SharedCarousel = memo(function SharedCarousel({
  apartment,
  isFullscreen,
  selectedIndex,
  setSelectedIndex,
  onToggleFullscreen,
  onCloseDialog,
}: SharedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 18,
    watchDrag: true,
    startIndex: selectedIndex,
  })

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== selectedIndex) {
      emblaApi.scrollTo(selectedIndex, true)
    }
  }, [selectedIndex, emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") emblaApi.scrollNext()
      if (e.key === "ArrowLeft") emblaApi.scrollPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [emblaApi])

  return (
    <div
      className={`relative w-full bg-black select-none overflow-hidden ${
        isFullscreen ? "h-[100dvh] min-h-[100dvh]" : "h-[40vh] sm:h-[45vh]"
      }`}
    >
      {/* ─── BOTONES FLOTANTES CONFIGURABLES ─── */}
      {isFullscreen ? (
        // Modo Fullscreen: Solo botón de cerrar arriba a la derecha
        <button
          className="absolute right-4 top-4 z-50 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 active:scale-95 pointer-events-auto touch-manipulation"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFullscreen() // En fullscreen, esto minimiza a modo galería
          }}
          aria-label="Cerrar pantalla completa"
        >
          <X className="size-5" />
        </button>
      ) : (
        // Modo Galería Normal: Distribución solicitada (FullScreen Izquierda, Cerrar Derecha)
        <>
          <button
            className="absolute left-4 top-4 z-30 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:scale-95 hover:bg-black/60 pointer-events-auto transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFullscreen()
            }}
            aria-label="Ver en pantalla completa"
          >
            <Maximize2 className="size-4" />
          </button>

          <button
            className="absolute right-4 top-4 z-30 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:scale-95 hover:bg-black/60 pointer-events-auto transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onCloseDialog) onCloseDialog()
            }}
            aria-label="Cerrar ventana"
          >
            <X className="size-5" />
          </button>
        </>
      )}

      {/* VIEWPORT DE EMBLA */}
      <div
        className="overflow-hidden w-full h-full pointer-events-auto"
        ref={emblaRef}
        style={{ height: "100%", minHeight: "100%", touchAction: "pan-y" }}
      >
        <div className="flex h-full w-full items-stretch">
          {apartment.images.map((img, i) => (
            <div
              key={img}
              className="relative min-w-0 flex-[0_0_100%] h-full w-full overflow-hidden pointer-events-none"
            >
              {Math.abs(i - selectedIndex) <= 1 ? (
                <Image
                  src={img}
                  alt={`${apartment.name} - ${i + 1}`}
                  fill
                  style={{ objectPosition: "center" }}
                  className={`transition-all duration-200 pointer-events-auto ${
                    isFullscreen ? "object-contain bg-black" : "cursor-pointer object-cover"
                  }`}
                  sizes={isFullscreen ? "100vw" : "(max-width: 640px) 100vw, 672px"}
                  priority={i === selectedIndex}
                  onClick={!isFullscreen ? onToggleFullscreen : undefined}
                />
              ) : (
                <div className="h-full w-full bg-neutral-950 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES LATERALES Y PUNTOS */}
      {apartment.images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollPrev() }}
            className="absolute left-4 top-1/2 z-30 hidden md:flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-md"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollNext() }}
            className="absolute right-4 top-1/2 z-30 hidden md:flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-md"
          >
            <ChevronRight className="size-6" />
          </button>

          <CarouselDots
            total={apartment.images.length}
            selectedIndex={selectedIndex}
            onSelect={(i) => emblaApi?.scrollTo(i)}
          />
        </>
      )}
    </div>
  )
})

const CarouselDots = memo(function CarouselDots({
  total,
  selectedIndex,
  onSelect,
}: {
  total: number
  selectedIndex: number
  onSelect: (i: number) => void
}) {
  const isLarge = total > MAX_DOTS
  const half = Math.floor(MAX_DOTS / 2)
  const start = isLarge ? Math.max(0, Math.min(selectedIndex - half, total - MAX_DOTS)) : 0
  const visible = useMemo(() => Array.from({ length: Math.min(total, MAX_DOTS) }, (_, i) => start + i), [start, total])

  return (
    <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 pointer-events-auto">
      <div className="flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg">
        {isLarge && selectedIndex > half && <span className="text-xs text-white/50">···</span>}
        {visible.map((i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
            className={`size-2.5 rounded-full transition-all touch-manipulation ${
              i === selectedIndex ? "w-5 bg-white" : "bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
        {isLarge && start + MAX_DOTS < total && <span className="text-xs text-white/50">···</span>}
      </div>
    </div>
  )
})

// ─── COMPONENTE PRINCIPAL (PORTAL SYSTEM) ───────────────────────────────────

interface ApartmentDetailDialogProps {
  apartment: Apartment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApartmentDetailDialog({
  apartment,
  open,
  onOpenChange,
}: ApartmentDetailDialogProps) {
  const [view, setView] = useState<"gallery" | "fullscreen">("gallery")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (apartment) {
      setView("gallery")
      setSelectedIndex(0)
    }
  }, [apartment?.id])

  useEffect(() => {
    if (view !== "fullscreen") return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setView("gallery")
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [view])

  if (!apartment) return null

  const isFullscreen = view === "fullscreen"

  return (
    <>
      <Dialog 
        open={open && !isFullscreen} 
        onOpenChange={onOpenChange}
      >
        {/* Desactivamos el botón de cierre nativo de Radix (showCloseButton={false}) porque ya pintamos el nuestro personalizado arriba a la derecha */}
        <DialogContent 
          showCloseButton={false}
          className="p-0 border-0 gap-0 flex flex-col max-h-[90vh] w-[95vw] max-w-2xl rounded-2xl bg-card shadow-lg overflow-y-auto"
        >
          {/* MODO GALERÍA NORMAL */}
          <div className="rounded-t-2xl overflow-hidden shrink-0">
            <SharedCarousel
              apartment={apartment}
              isFullscreen={false}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onToggleFullscreen={() => setView("fullscreen")}
              onCloseDialog={() => onOpenChange(false)} // Pasa la función de cierre al botón flotante derecho
            />
          </div>

          <div className="p-6 sm:p-10">
            <ApartmentInfo
              name={apartment.name}
              type={apartment.type}
              description={apartment.description}
              guests={apartment.guests}
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              petsAllowed={apartment.petsAllowed}
              stairs={apartment.stairs}
            />
          </div>

          <div className="sticky bottom-0 mt-auto shrink-0 border-t border-border/40 bg-card/90 backdrop-blur-md p-6 z-10">
            <Button
              className="btn-tactile w-full py-6 text-base rounded-full"
              size="lg"
              onClick={() => {
                onOpenChange(false)
                window.open(apartment.booking, "_blank")
              }}
            >
              Consultar disponibilidad
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PORTAL NATIVO PARA FULLSCREEN */}
      {isFullscreen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] h-[100dvh] w-screen bg-black overflow-hidden select-none"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <SharedCarousel
            apartment={apartment}
            isFullscreen={true}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onToggleFullscreen={() => setView("gallery")}
          />
        </div>,
        document.body
      )}
    </>
  )
}

// ─── COMPONENTES ESTÁTICOS DE INFORMACIÓN ───────────────────────────────────

const AmenitiesSection = memo(function AmenitiesSection() {
  return (
    <div>
      <h4 className="font-montserrat text-lg font-medium text-foreground">Comodidades</h4>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {amenities.map((amenity) => {
          const Icon = amenity.icon
          return (
            <div key={amenity.label} className="flex items-center gap-3 text-muted-foreground">
              <Icon className="size-5 text-primary" />
              <span className="font-light">{amenity.label}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-foreground">Cocina equipada con:</p>
        <p className="mt-2 text-sm font-light text-muted-foreground">{kitchenDetails.join(" · ")}</p>
      </div>
    </div>
  )
})

const PoliciesSection = memo(function PoliciesSection() {
  return (
    <div className="rounded-xl bg-secondary/50 p-6">
      <h4 className="font-montserrat text-lg font-medium text-foreground">Políticas</h4>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-3">
          <Calendar className="size-4 text-primary" />
          <span className="font-light"><strong className="font-medium">Check-in:</strong> A partir de las 16:00</span>
        </p>
        <p className="flex items-center gap-3">
          <Calendar className="size-4 text-primary" />
          <span className="font-light"><strong className="font-medium">Check-out:</strong> Antes de las 11:00</span>
        </p>
        <p className="flex items-center gap-3">
          <CreditCard className="size-4 text-primary" />
          <span className="font-light"><strong className="font-medium">Cancelación:</strong> 100% reembolsable hasta 14 días antes</span>
        </p>
      </div>
    </div>
  )
})

const ApartmentInfo = memo(function ApartmentInfo({
  name,
  type,
  description,
  guests,
  bedrooms,
  bathrooms,
  petsAllowed,
  stairs,
}: {
  name: string
  type: string
  description: string
  guests: number
  bedrooms: number
  bathrooms: number
  petsAllowed: boolean
  stairs?: boolean
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-great-vibes text-5xl font-medium">{name}</DialogTitle>
        <DialogDescription className="mt-2 text-base text-muted-foreground">
          {type} · Hasta {guests} huéspedes
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 space-y-8">
        <div>
          <h4 className="font-montserrat text-lg font-medium text-foreground">Descripción</h4>
          <p className="mt-3 font-light leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div>
          <h4 className="font-montserrat text-lg font-medium text-foreground">Capacidad</h4>
          <div className="mt-3 flex flex-wrap gap-6 text-muted-foreground">
            <span className="flex items-center gap-2"><Users className="size-5 text-primary" />{guests} huéspedes</span>
            <span className="flex items-center gap-2"><BedDouble className="size-5 text-primary" />{bedrooms} {bedrooms === 1 ? "cama" : "camas"}</span>
            <span className="flex items-center gap-2"><Bath className="size-5 text-primary" />{bathrooms} {bathrooms === 1 ? "baño" : "baños"}</span>
          </div>
        </div>
        <AmenitiesSection />
        <div>
          <h4 className="font-montserrat text-lg font-medium text-foreground">Mascotas</h4>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <PawPrint className="size-5 text-primary" />
            <span className="font-light">{petsAllowed ? "Se admiten mascotas" : "No se admiten mascotas"}</span>
          </p>
          {stairs && <p className="mt-3 text-sm font-light text-muted-foreground">Nota: Acceso mediante escaleras</p>}
        </div>
        <PoliciesSection />
      </div>
    </>
  )
})