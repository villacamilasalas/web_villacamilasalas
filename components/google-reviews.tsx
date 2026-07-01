"use client";

import { useRef, useState, useMemo } from "react";
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import reviewsData from "@/data/reviews.json";

type Review = (typeof reviewsData.reviews)[number];

const PLACE_ID = "ChIJmenWj8y7Ng0RrhLPf4qqO5g";

function getRelativeTime(dateISO: string) {
  const now = new Date();
  const date = new Date(dateISO);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Recién", isNew: true };
  if (diffDays === 0) return { label: "Hoy", isNew: true };
  if (diffDays === 1) return { label: "Ayer", isNew: true };
  if (diffDays < 7) return { label: `Hace ${diffDays} días`, isNew: true };

  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return { label: "Hace 1 semana", isNew: false };
  if (weeks < 5) return { label: `Hace ${weeks} semanas`, isNew: false };

  const months = Math.floor(diffDays / 30);
  if (months === 1) return { label: "Hace 1 mes", isNew: false };
  return { label: `Hace ${months} meses`, isNew: false };
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function StarRating({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const { summary, reviews } = reviewsData;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Estado del modal polimórfico (acepta IA y Usuarios)
  const [activeModal, setActiveModal] = useState<{
    title: string;
    text: string;
    isAI: boolean;
    avatar?: string;
    avatarColor?: string;
    rating?: number;
    date?: string;
    verified?: boolean;
  } | null>(null);

  const reviewsWithMeta = useMemo(
    () =>
      reviews.map((r) => {
        const { label, isNew } = getRelativeTime(r.dateISO);
        return { ...r, relativeDate: label, isNew };
      }),
    [reviews],
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = window.innerWidth < 640 ? 300 : 424; // Adapta la cantidad de scroll por dispositivo
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-16 w-full max-w-full overflow-hidden px-1">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <GoogleIcon className="size-6 shrink-0" />
          <span className="text-base font-medium text-foreground">Google</span>
          <span className="text-base font-semibold text-foreground">Excelente</span>
          <div className="flex shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-lg font-semibold text-foreground">{summary.rating}</span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">{summary.totalReviews} reseñas</span>
        </div>
        
        <Button variant="outline" className="rounded-lg border-border font-medium w-full sm:w-auto" asChild>
          <a
            href={`https://search.google.com/local/writereview?placeid=${PLACE_ID}`}
            target="_blank"
            rel="noreferrer"
          >
            Escribir una reseña
          </a>
        </Button>
      </div>

      {/* Contenedor relativo del Carrusel con Controles Flotantes */}
      <div className="relative group">
        {/* Flecha Izquierda Flotante */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 size-10 rounded-full bg-background/90 backdrop-blur-sm shadow-md border-border"
          onClick={() => scroll("left")}
          aria-label="Anterior"
        >
          <ChevronLeft className="size-5 text-foreground" />
        </Button>

        {/* Flecha Derecha Flotante */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 size-10 rounded-full bg-background/90 backdrop-blur-sm shadow-md border-border"
          onClick={() => scroll("right")}
          aria-label="Siguiente"
        >
          <ChevronRight className="size-5 text-foreground" />
        </Button>

        {/* Carrusel Deslizable */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 md:px-0 -mx-4 sm:-mx-6 md:mx-0 select-none"
        >
          {/* AI Summary Card */}
          <div className="flex flex-col w-[290px] min-w-[290px] xs:w-[320px] xs:min-w-[320px] sm:w-[400px] sm:min-w-[400px] h-[290px] shrink-0 snap-start rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/30 p-6 border border-indigo-100/50 dark:border-indigo-950/50 shadow-sm justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="flex -space-x-2.5">
                <div className="size-9 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center text-[11px] font-bold text-white">MG</div>
                <div className="size-9 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center text-[11px] font-bold text-white">JL</div>
                <div className="size-9 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center text-[11px] font-bold text-white">CG</div>
                <div className="size-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center text-[10px] font-extrabold text-white">
                  <Sparkles className="size-3.5 fill-white" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground flex items-center justify-end gap-1">
                  Resumen IA
                </p>
                <p className="text-xs text-muted-foreground">En base a {summary.totalReviews} reseñas</p>
              </div>
            </div>
            
            <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80 line-clamp-5">
              {summary.aiSummary}
            </p>
            
            <button 
              onClick={() => setActiveModal({ title: "Resumen de Inteligencia Artificial", text: summary.aiSummary, isAI: true })}
              className="mt-2 self-start text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
            >
              Leer más
            </button>
          </div>

          {/* Review Cards de Usuarios */}
          {reviewsWithMeta.map((review, i) => (
            <div
              key={i}
              className="relative flex flex-col w-[290px] min-w-[290px] xs:w-[320px] xs:min-w-[320px] sm:w-[400px] sm:min-w-[400px] h-[290px] shrink-0 snap-start rounded-2xl border border-border/70 bg-card p-6 shadow-sm justify-between"
            >
              <div className="absolute right-6 top-6">
                <GoogleIcon className="size-4.5 opacity-90" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${review.avatarColor}`}>
                    {review.avatar}
                  </div>
                  <div className="min-w-0 pr-6">
                    <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.relativeDate}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <StarRating rating={review.rating} size="size-4" />
                  {review.verified && (
                    <CheckCircle2 className="size-4 fill-blue-500 text-white" />
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/90 line-clamp-4">
                  {review.text || <span className="text-muted-foreground italic">Sin comentario escrito.</span>}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between pt-1">
                {review.text && review.text.length > 120 ? (
                  <button
                    onClick={() => setActiveModal({
                      title: review.name,
                      text: review.text,
                      isAI: false,
                      avatar: review.avatar,
                      avatarColor: review.avatarColor,
                      rating: review.rating,
                      date: review.relativeDate,
                      verified: review.verified
                    })}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leer más
                  </button>
                ) : (
                  <div />
                )}
                {review.isNew && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400 tracking-wide">
                    NUEVA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Dialog Polimórfico */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6">
          {activeModal && (
            <>
              <DialogHeader className="text-left">
                {activeModal.isAI ? (
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                      <Sparkles className="size-4 fill-white" />
                    </div>
                    <DialogTitle className="text-base font-bold">{activeModal.title}</DialogTitle>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${activeModal.avatarColor}`}>
                      {activeModal.avatar}
                    </div>
                    <div>
                      <DialogTitle className="text-base font-semibold">{activeModal.title}</DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">{activeModal.date}</DialogDescription>
                    </div>
                  </div>
                )}
              </DialogHeader>

              {!activeModal.isAI && activeModal.rating && (
                <div className="flex items-center gap-2 my-2">
                  <StarRating rating={activeModal.rating} size="size-4" />
                  {activeModal.verified && (
                    <CheckCircle2 className="size-4 fill-blue-500 text-white" />
                  )}
                </div>
              )}

              <p className="text-sm leading-relaxed text-foreground/90 mt-2 whitespace-pre-wrap">
                {activeModal.text}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}