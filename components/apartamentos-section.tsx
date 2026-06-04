"use client"

import { useState } from "react"
import { apartments } from "@/data/apartments"
import type { Apartment } from "@/data/apartments"
import { ApartmentCard } from "@/components/apartment-card"
import { ApartmentDetailDialog } from "@/components/apartment-detail-dialog"
import { WatercolorDecoration } from "@/components/watercolor-decoration"

export function ApartamentosSection() {
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleApartmentClick = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setIsDialogOpen(true)
  }

  return (
    <section
      id="apartamentos"
      className="bg-secondary/50 py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Nuestros alojamientos
          </p>
          <h2 className="mt-4 font-montserrat text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Apartamentos con Encanto
          </h2>
          <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
            Seis apartamentos únicos, cada uno con su propia personalidad, todos
            equipados con todo lo que necesitas para una estancia perfecta.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onClick={handleApartmentClick}
            />
          ))}
        </div>
      </div>

      <ApartmentDetailDialog
        apartment={selectedApartment}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </section>
  )
}
