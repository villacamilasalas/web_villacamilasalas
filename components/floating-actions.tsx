"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import InstagramIcon from "@mui/icons-material/Instagram"
import CallIcon from "@mui/icons-material/Call"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

const actions = [
  {
    href: "#",
    icon: KeyboardArrowUpIcon,
    label: "Arriba",
    ariaLabel: "Volver arriba",
  },
  {
    href: "https://wa.me/34689575612",
    icon: WhatsAppIcon,
    label: "WhatsApp",
    ariaLabel: "Contactar por WhatsApp",
  },
  {
    href: "https://www.instagram.com/villacamilaapartamentos/",
    icon: InstagramIcon,
    label: "Instagram",
    ariaLabel: "Abrir Instagram",
  },
  {
    href: "tel:+34689575612",
    icon: CallIcon,
    label: "Llamar",
    ariaLabel: "Llamar por teléfono",
  },
]

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const entornoSection = document.getElementById("inicio")
      if (entornoSection) {
        // Obtenemos la posición del final de la sección Entorno
        const entornoBottom = entornoSection.offsetTop + entornoSection.offsetHeight
        // Si el scroll vertical actual supera el final de Entorno, mostramos la flecha
        if (window.scrollY > entornoBottom - 100) { // El -100 da un margen de suavidad antes de entrar a "Qué Hacer"
          setShowScrollTop(true)
          return
        }
      }
      setShowScrollTop(false)
    }

    window.addEventListener("scroll", handleScroll)
    // Ejecutamos una vez al montar por si recargan la página abajo
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6 lg:right-8">
      {actions.map((action) => {
        const Icon = action.icon
        const isScrollToTop = action.href === "#"
        return (
          <div 
            key={action.label} 
            className={cn(
              "group relative transition-all duration-300",
              // Si es el botón de subir, controlamos su renderizado visual y eventos de puntero
              isScrollToTop && !showScrollTop ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          >
            {isScrollToTop ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex size-12 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-soft-xl backdrop-blur-md ring-1 ring-border/20 transition-all duration-300 hover:scale-105 hover:bg-primary/30 hover:text-primary hover:ring-primary/20 active:scale-95 sm:size-[52px]"
                aria-label={action.ariaLabel}
              >
                <Icon className="size-5 sm:size-[22px]" />
              </button>
            ) : (
              <a
                href={action.href}
                target={action.href.startsWith("tel:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex size-12 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-soft-xl backdrop-blur-md ring-1 ring-border/20 transition-all duration-300 hover:scale-105 hover:bg-primary/30 hover:text-primary hover:ring-primary/20 active:scale-95 sm:size-[52px]"
                aria-label={action.ariaLabel}
              >
                <Icon className="size-5 sm:size-[22px]" />
              </a>
            )}
            <span className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100 sm:pointer-events-none">
              {action.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
