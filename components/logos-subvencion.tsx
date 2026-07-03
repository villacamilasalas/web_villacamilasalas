"use client";

export function LogosSubvencion() {
  return (
    <section className="w-full bg-card py-6 sm:py-8 lg:py-10 border-t border-b border-border/20">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <picture>
          <source srcSet="/LOGOS.avif" type="image/avif" />
          <source srcSet="/LOGOS.webp" type="image/webp" />
          <img
            src="/LOGOS.webp"
            alt="Logos de subvención del Gobierno de España y Fondos Europeos"
            className="mx-auto block h-auto w-full min-h-[45px] max-h-[90px] md:max-h-[110px] object-contain object-center select-none"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </section>
  );
}
