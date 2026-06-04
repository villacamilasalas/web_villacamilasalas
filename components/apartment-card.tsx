"use client";

import Image from "next/image"
import { Users, BedDouble, Bath, PawPrint, ArrowRight } from "lucide-react";
import type { Apartment } from "@/data/apartments";

interface ApartmentCardProps {
  apartment: Apartment;
  onClick: (apartment: Apartment) => void;
}

export function ApartmentCard({ apartment, onClick }: ApartmentCardProps) {
  return (
    <article
      className="card-reveal group cursor-pointer rounded-2xl border border-border/40 bg-card shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => onClick(apartment)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(apartment);
        }
      }}
    >
      <div className="img-reveal relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <Image
          src={apartment.images[0]}
          alt={apartment.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute right-4 top-4 rounded-full bg-card/95 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground backdrop-blur-sm">
          {apartment.type}
        </div>
      </div>
      <div className="p-7 pt-5">
        <h3 className="font-great-vibes text-4xl font-medium text-foreground">
          {apartment.name}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {apartment.guests}
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" />
            {apartment.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" />
            {apartment.bathrooms}
          </span>
          {apartment.petsAllowed && (
            <span className="flex items-center gap-1.5 text-primary">
              <PawPrint className="size-4" />
            </span>
          )}
        </div>
        <div className="mt-6 flex items-center text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
          <span>Ver detalles</span>
          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
}
