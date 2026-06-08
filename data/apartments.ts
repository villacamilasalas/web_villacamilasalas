import { Wifi, Tv, ChefHat, Flame } from "lucide-react"
import { apartmentImages } from "./apartment-images"

export interface Apartment {
  id: number
  name: string
  type: string
  guests: number
  bedrooms: number
  bathrooms: number
  petsAllowed: boolean
  description: string
  images: string[]
  booking: string
  stairs?: boolean
}

export interface Amenity {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export const apartments: Apartment[] = [
  {
    id: 1,
    name: "El Viandero",
    type: "Apartamento",
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    petsAllowed: true,
    description:
      "Un acogedor apartamento que combina la tradición asturiana con todas las comodidades modernas. Perfecto para parejas o familias pequeñas que buscan una escapada tranquila en el corazón de Salas.",
    images: apartmentImages[1],
    booking:
      "https://reservas.rentitup.es/listings/516066?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
  {
    id: 2,
    name: "El Llagar",
    type: "Apartamento",
    guests: 3,
    bedrooms: 2,
    bathrooms: 1,
    petsAllowed: true,
    description:
      "Inspirado en los tradicionales lagares asturianos, este encantador estudio ofrece un espacio íntimo y cálido. Ideal para una pareja o viajeros solitarios que aprecian la autenticidad.",
    images: apartmentImages[2],
    booking:
      "https://reservas.rentitup.es/listings/516089?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
  {
    id: 3,
    name: "La Cuesta",
    type: "Apartamento",
    guests: 3,
    bedrooms: 2,
    bathrooms: 1,
    petsAllowed: true,
    description:
      "Con vistas a las verdes colinas de Salas, La Cuesta es un refugio perfecto para desconectar. Su diseño funcional y acogedor te hará sentir como en casa desde el primer momento.",
    images: apartmentImages[3],
    booking:
      "https://reservas.rentitup.es/listings/516091?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
  {
    id: 4,
    name: "El Pajar",
    type: "Dúplex",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    petsAllowed: false,
    stairs: true,
    description:
      "Nuestro espacioso dúplex es ideal para familias o grupos de amigos. Distribuido en dos plantas, ofrece amplitud y privacidad. Nota: acceso mediante escaleras.",
    images: apartmentImages[4],
    booking:
      "https://reservas.rentitup.es/listings/516112?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
  {
    id: 5,
    name: "El Pozo",
    type: "Apartamento",
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    petsAllowed: false,
    description:
      "Nombrado en honor a los antiguos pozos que abastecían a la villa, El Pozo combina historia y confort. Un espacio luminoso y bien equipado para unas vacaciones perfectas.",
    images: apartmentImages[5],
    booking: 
      "https://reservas.rentitup.es/listings/516122?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
  {
    id: 6,
    name: "La Figal",
    type: "Apartamento",
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    petsAllowed: false,
    description:
      "La Figal evoca los paisajes de higueras del occidente asturiano. Un apartamento sereno y bien iluminado, perfecto para quienes buscan paz y naturaleza.",
    images: apartmentImages[6],
    booking:
      "https://reservas.rentitup.es/listings/516130?numberOfGuests=2&city=Villarraba&utm_source=ig&utm_medium=social&utm_content=link_in_bio",
  },
]

export const amenities: Amenity[] = [
  { icon: Wifi, label: "WiFi alta velocidad" },
  { icon: Tv, label: "Smart TV" },
  { icon: ChefHat, label: "Cocina completa" },
  { icon: Flame, label: "Calefacción" },
]

export const kitchenDetails = ["Lavavajillas", "Lavadora", "Horno", "Cafetera"]
