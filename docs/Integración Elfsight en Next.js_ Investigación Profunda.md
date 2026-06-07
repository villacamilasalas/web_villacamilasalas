# **Arquitectura de Integración y Optimización del Widget de Reseñas de Elfsight en Next.js (App Router), React 19, Tailwind CSS v4 y Radix UI**

La integración de componentes de terceros basados en inyecciones dinámicas de JavaScript en arquitecturas modernas de renderizado reactivo plantea retos complejos de rendimiento, diseño y consistencia de datos. Este informe técnico aborda de forma exhaustiva las estrategias necesarias para acoplar el widget de reseñas de Elfsight en una plataforma que utiliza Next.js (App Router), React 19, TypeScript estricto, Tailwind CSS v4 y los primitivos headless de Radix UI. Se analizan de forma pormenorizada las implicaciones en los Core Web Vitals, las limitaciones de diseño impuestas por el Shadow DOM, las incompatibilidades de la especificación Houdini de CSS en Tailwind v4 y se implementa una solución automatizada para evitar la degradación visual por el agotamiento del límite de visualizaciones del plan gratuito de Elfsight.1

## **Arquitectura de carga y rendimiento (Web Vitals)**

La inclusión de recursos externos de JavaScript suele constituir la causa principal del incumplimiento de los umbrales de rendimiento de los Core Web Vitals en Next.js.3 Al delegar la manipulación de la interfaz a scripts externos, el hilo principal de ejecución se ve comprometido, afectando directamente a las métricas del Tiempo de Bloqueo Total (TBT) y de la Interacción con el Siguiente Renderizado (INP).3

### **Optimización del hilo principal: afterInteractive vs lazyOnload**

El componente \<Script /\> de Next.js gestiona la prioridad de descarga y ejecución de recursos externos mediante su propiedad strategy.4 Para scripts de widgets interactivos no críticos como el de Elfsight (https://static.elfsight.com/platform/platform.js), la elección de la estrategia determina si el sitio web superará o no las auditorías de rendimiento del navegador.3

| Dimensión de Rendimiento | Estrategia afterInteractive (Por defecto) | Estrategia lazyOnload (Recomendada) |
| :---- | :---- | :---- |
| **Inyección en el DOM** | Inmediatamente después de completarse la hidratación inicial de React en el cliente.4 | Durante los periodos de inactividad del navegador (*idle time*), tras cargar todos los recursos críticos.4 |
| **Impacto en CPU (TBT)** | Elevado. Compite directamente con el hilo principal mientras React procesa la reactividad y los manejadores de eventos iniciales.3 | Mínimo. Al ejecutarse en momentos de inactividad, evita la saturación de la cola de tareas del navegador.3 |
| **Impacto en Reactividad (INP)** | Significativo. Puede retrasar la respuesta del navegador ante clics o pulsaciones del usuario debido a tareas largas de evaluación del script de terceros.3 | Despreciable. Desplaza el procesamiento pesado del widget fuera de la ventana de interacción crítica del usuario.3 |
| **Prioridad de Red** | Media-Alta.4 | Muy Baja.4 |
| **Mejora Empírica de INP** | Línea de base. | Reducción promedio de hasta 27ms en el INP frente a afterInteractive en entornos de producción.3 |

El análisis de la ejecución revela que la hidratación de Next.js requiere que el hilo principal procese el árbol de componentes sin interrupciones.3 Cuando un script como el de Elfsight se carga con afterInteractive, el navegador pausa la compilación del código de la aplicación para descargar, parsear y ejecutar el JavaScript de terceros.3 Al cambiar a lazyOnload, el hilo de ejecución prioritario queda reservado exclusivamente para la interactividad propia de la aplicación, delegando el widget a un segundo plano táctico.3

### **Prevención de Cumulative Layout Shift (CLS) mediante reservas de espacio estáticas**

Elfsight inicializa su interfaz de forma asíncrona inyectando nodos HTML dentro de un Shadow DOM o iFrame.7 Esta inyección tardía provoca desplazamientos bruscos del contenido inferior de la página, penalizando la métrica de Cumulative Layout Shift (CLS).8  
Para neutralizar el CLS, es obligatorio reservar un contenedor con dimensiones mínimas explícitas equivalentes al tamaño final del widget.10 Dado que la altura del widget varía según el dispositivo, se define un esquema de reserva responsivo utilizando el motor basado en variables CSS nativas de Tailwind CSS v4 12:

| Dispositivo / Pantalla | Altura Típica del Widget (Carousel / Grid) | Clases de Reserva (Tailwind v4) |
| :---- | :---- | :---- |
| Móvil (\< 480px) | \~300px 13 | min-h-\[300px\] h-\[300px\] 13 |
| Tablet / Escritorio (\>= 481px) | \~500px 13 | md:min-h-\[500px\] md:h-\[500px\] 13 |

La reserva de espacio debe acompañarse de un esqueleto visual (*skeleton*) animado para mejorar la experiencia de carga percibida por el usuario mientras el script asíncrono se completa y monta el contenido interactivo.7

## **Código de integración robusto con TypeScript**

En Next.js (App Router), el renderizado del lado del servidor (SSR) es el comportamiento predeterminado de los componentes. El widget de Elfsight realiza una manipulación directa del DOM del navegador que resulta totalmente incompatible con el entorno del servidor Node.js, lo que provocaría fallos críticos si se intentara ejecutar de forma directa.15  
Para garantizar que el pre-renderizado del servidor no sufra discrepancias con el cliente (*hydration mismatch*), el componente de integración debe registrarse con la directiva 'use client' 5 y su inicialización visual debe diferirse de forma estricta hasta que se complete el ciclo de vida de montaje de React.16  
El siguiente componente, denominado ElfsightReviews.tsx, implementa un tipado estricto en TypeScript bajo modo estricto, encapsulando la carga diferida nativa de Elfsight (data-elfsight-app-lazy) 14 y asegurando una transición fluida mediante un estado de carga:

TypeScript  
'use client';

import React, { useState, useEffect } from 'react';  
import Script from 'next/script';

/\*\*  
 \* Modos de carga diferida soportados de forma nativa por el script de Elfsight.  
 \* \- 'enabled': Se carga cuando entra en el viewport o tras la primera interacción.  
 \* \- 'first-activity': Se carga exclusivamente al detectar interacción del usuario (scroll, mousemove).  
 \* \- 'in-viewport': Se carga únicamente cuando el contenedor entra en el viewport del navegador.  
 \* \- 'disabled': Desactiva la carga perezosa y fuerza la descarga inmediata junto con los assets principales.  
 \*/  
export type ElfsightLazyMode \= 'enabled' | 'disabled' | 'first-activity' | 'in-viewport';

export interface ElfsightReviewsProps {  
  /\*\* Identificador alfanumérico único del widget obtenido en la consola de Elfsight. \*/  
  widgetId: string;  
  /\*\* Configuración de carga perezosa nativa del widget para optimizar Web Vitals. \*/  
  lazyMode?: ElfsightLazyMode;  
  /\*\* Altura reservada predeterminada para evitar fluctuaciones de diseño (CLS) en móviles. \*/  
  mobileHeight?: number;  
  /\*\* Altura reservada predeterminada para evitar fluctuaciones de diseño (CLS) en escritorio. \*/  
  desktopHeight?: number;  
  /\*\* Clases CSS adicionales para personalizar el contenedor exterior mediante Tailwind CSS. \*/  
  className?: string;  
}

/\*\*  
 \* Componente de integración robusto para widgets de reseñas de Elfsight en Next.js (App Router).  
 \* Previene el desajuste de hidratación (hydration mismatch) y optimiza la carga del script externo.  
 \*/  
export function ElfsightReviews({  
  widgetId,  
  lazyMode \= 'enabled',  
  mobileHeight \= 300,  
  desktopHeight \= 500,  
  className \= '',  
}: ElfsightReviewsProps): React.JSX.Element {  
  const \[isMounted, setIsMounted\] \= useState\<boolean\>(false);  
  const \= useState\<boolean\>(false);

  // Garantiza que el script y el marcado dinámico solo se procesen tras el montaje en el cliente.  
  useEffect(() \=\> {  
    setIsMounted(true);  
  },);

  // Construye dinámicamente los atributos de carga diferida de Elfsight.  
  const getLazyAttributes \= (): Record\<string, string\> \=\> {  
    if (lazyMode \=== 'disabled') return {};  
    return {  
      'data-elfsight-app-lazy': lazyMode \=== 'enabled'? '' : lazyMode,  
    };  
  };

  // Marcador de posición seguro para el servidor (SSR) y fase pre-hidratación.  
  if (\!isMounted) {  
    return (  
      \<div  
        style={{  
          '--mobile-h': \`${mobileHeight}px\`,  
          '--desktop-h': \`${desktopHeight}px\`,  
        } as React.CSSProperties}  
        className={\`w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 min-h-\[var(--mobile-h)\] md:min-h-\[var(--desktop-h)\] ${className}\`}  
        aria-hidden="true"  
      /\>  
    );  
  }

  return (  
    \<div  
      style={{  
        '--mobile-h': \`${mobileHeight}px\`,  
        '--desktop-h': \`${desktopHeight}px\`,  
      } as React.CSSProperties}  
      className={\`relative w-full min-h-\[var(--mobile-h)\] md:min-h-\[var(--desktop-h)\] ${className}\`}  
    \>  
      {/\* Esqueleto visual de prevención de CLS animado por hardware mediante Tailwind CSS v4 \*/}  
      {\!isScriptLoaded && (  
        \<div  
          className="absolute inset-0 w-full flex flex-col justify-between p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 animate-pulse transition-opacity duration-300"  
          style={{ height: '100%' }}  
        \>  
          \<div className="flex items-center gap-4"\>  
            \<div className="size-12 rounded-full bg-neutral-200 dark:bg-neutral-800" /\>  
            \<div className="space-y-2 flex-1"\>  
              \<div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
              \<div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
            \</div\>  
          \</div\>  
          \<div className="space-y-3 my-6 flex-1 justify-center flex flex-col"\>  
            \<div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" /\>  
            \<div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
            \<div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
          \</div\>  
          \<div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" /\>  
        \</div\>  
      )}

      {/\* Contenedor donde Elfsight inyectará el Shadow DOM \*/}  
      \<div  
        className={\`elfsight-app-${widgetId} transition-opacity duration-500 ${  
          isScriptLoaded? 'opacity-100' : 'opacity-0'  
        }\`}  
        {...getLazyAttributes()}  
      /\>

      {/\* Script optimizado con estrategia diferida no bloqueante \*/}  
      \<Script  
        src="https://static.elfsight.com/platform/platform.js"  
        strategy="lazyOnload"  
        data-use-service-core  
        onLoad={() \=\> setIsScriptLoaded(true)}  
      /\>  
    \</div\>  
  );  
}

## **Solución de conflictos de estilos: Tailwind CSS v4 y Elfsight Shadow DOM**

Elfsight encapsula sus componentes dentro de un Shadow DOM abierto.8 Esta especificación aísla el DOM interno impidiendo que las reglas del CSS global de la aplicación (como los estilos compilados de Tailwind v4) afecten a los nodos que se encuentran dentro del Shadow Root.8

### **Sincronización nativa de variables CSS de Tailwind v4**

A pesar del aislamiento del Shadow DOM, existe una vía de comunicación directa: la herencia de propiedades personalizadas (variables CSS).8 Las variables declaradas en el bloque :root del documento principal traspasan la frontera del Shadow DOM y son legibles por los elementos internos.19  
La nueva arquitectura de Tailwind CSS v4 elimina el archivo de configuración en formato JavaScript e introduce un sistema basado en directivas CSS nativas dentro de la capa @theme.12 Al compilarse la hoja de estilos de la aplicación, Tailwind v4 inyecta automáticamente todos los tokens de diseño (colores, espaciados, fuentes y sombras) en forma de variables nativas en el selector :root.12

CSS  
/\* Resultado de la compilación automática de Tailwind v4 en el documento global \*/  
:root {  
  \--font-sans: "Inter", system-ui, sans-serif;  
  \--color-neutral-100: \#f5f5f5;  
  \--color-neutral-900: \#171717;  
  \--color-primary-600: \#2563eb;  
  \--radius-xl: 1rem;  
}

Para explotar esta ventaja técnica sin alterar la integridad del componente, el ingeniero de software debe sincronizar estos tokens con la interfaz de Elfsight.13 Esto se logra accediendo al panel administrativo en la plataforma en la nube de Elfsight, seleccionando el widget correspondiente e inyectando un bloque CSS a través de su editor de código integrado en la sección de **Custom CSS** 13:

CSS  
/\* CSS inyectado en el panel administrativo de Elfsight para sincronización de tokens \*/  
.global-styles,   
 {  
  font-family: var(--font-sans)\!important;  
}

\[class\*="Card\_\_Container"\] {  
  background-color: var(--color-white)\!important;  
  border: 1px solid var(--color-neutral-200)\!important;  
  border-radius: var(--radius-xl)\!important;  
  box-shadow: var(--shadow-sm)\!important;  
}

\[class\*="Card\_\_AuthorName"\] {  
  color: var(--color-neutral-900)\!important;  
  font-weight: var(--font-weight-semibold)\!important;  
}

 {  
  background-color: var(--color-primary-600)\!important;  
  border-radius: var(--radius-lg)\!important;  
}

Nota: Para los elementos emergentes (modales de reseñas), es imprescindible anteponer la clase .global-styles para sortear prioridades internas de especificidad de Elfsight.13 Las clases del widget que contienen sufijos aleatorios autogenerados se neutralizan utilizando selectores basados en atributos de coincidencia parcial como \[class\*="Card\_\_Container"\].13

### **Piercing del Shadow DOM de Elfsight: Limitaciones de @property y técnicas programáticas**

Tailwind CSS v4 utiliza de forma intensiva la regla @property de CSS para tipar variables (por ejemplo, definir si una variable CSS de animación o transformación es de tipo \<color\> o \<percentage\>) y dotarlas de valores por defecto.24 De acuerdo con las especificaciones del estándar del consorcio W3C (específicamente la especificación CSS Houdini), las declaraciones @property no están soportadas dentro de hojas de estilo adjuntas o aplicadas directamente a nivel de un Shadow Root local.24  
Si un equipo de ingeniería decide empaquetar una instancia de Tailwind CSS v4 para inyectarla directamente dentro de un Shadow DOM para forzar estilos locales complejos, las declaraciones de variables construidas bajo @property fallarán silenciosamente en el navegador.24 Esto inutilizará utilidades complejas de Tailwind v4 tales como transiciones, filtros y efectos espaciales.24  
Para eludir estas barreras de seguridad y aislamiento visual del Shadow DOM sin perder la cohesión estética del sitio, la aplicación de Next.js puede implementar una técnica programática de "fuerza bruta" o *Shadow DOM Piercing* en el cliente, inyectando hojas de estilo directamente sobre el nodo raíz una vez inicializado 17:

TypeScript  
/\*\*  
 \* Inyecta programáticamente estilos CSS dinámicos directamente dentro del Shadow DOM  
 \* de un widget específico de Elfsight tras constatar su inicialización en el cliente.  
 \*/  
export function injectStylesToElfsightShadow(widgetId: string, cssRules: string): void {  
  const host \= document.querySelector(\`.elfsight-app-${widgetId}\`);  
  if (host && host.shadowRoot) {  
    const shadow \= host.shadowRoot;  
    // Evita duplicaciones de la hoja de estilos inyectada  
    if (\!shadow.querySelector('\#custom-tailwind-piercing')) {  
      const styleElement \= document.createElement('style');  
      styleElement.id \= 'custom-tailwind-piercing';  
      styleElement.textContent \= cssRules;  
      shadow.appendChild(styleElement);  
    }  
  }  
}

Este procedimiento aprovecha que el Shadow DOM de Elfsight se inicializa en modo abierto (mode: "open"), lo que permite que el API de JavaScript consulte la propiedad shadowRoot de forma directa para inyectar recursos estéticos en tiempo de ejecución.17

## **Control de limitaciones del plan gratuito (200 views/mes)**

El plan gratuito de Elfsight limita rígidamente la visibilidad de los componentes a un volumen máximo de 200 impresiones mensuales.1 En el instante en que el contador de visitas alcanza dicho límite, el servidor de Elfsight desactiva el widget de forma remota, impidiendo su renderizado para los usuarios convencionales.1

### **Estrategia de evasión y detección programática del límite de cuota**

Cuando se sobrepasa la cuota establecida, el script platform.js altera su flujo normal de renderizado.30 En lugar de inyectar el árbol de nodos de la galería de reseñas en el Shadow DOM, este puede o bien permanecer totalmente vacío (ocultando el contenedor) o inyectar un marcado de advertencia específico indicando el bloqueo del widget.1  
Para evitar que el sitio web muestre una zona rota o un espacio en blanco inservible, es viable implementar un detector asíncrono que valide si el Shadow DOM ha fallado en cargar o se encuentra en estado inactivo tras una ventana de tiempo prudencial.17 Si el detector valida la inactividad, se activa un estado de contingencia (hasFailed \= true) que desactiva el widget externo y monta en su lugar un carrusel estático con datos pre-almacenados (*hardcoded*), preservando la experiencia de usuario y la prueba social del sitio de forma ininterrumpida.30

### **Componente protector de cuota con fallback estático de Radix UI**

El siguiente desarrollo, denominado ElfsightReviewsGuard.tsx, consolida el sistema de detección asíncrona mediante sondeo de elementos (*polling*) 32 y renderiza un carrusel estático totalmente responsivo estructurado con el primitivo estricto @radix-ui/react-scroll-area y Tailwind CSS v4 en caso de fallo detectado 33:

TypeScript  
'use client';

import React, { useState, useEffect, useRef } from 'react';  
import Script from 'next/script';  
import \* as ScrollArea from '@radix-ui/react-scroll-area';

export interface StaticReview {  
  id: string;  
  authorName: string;  
  avatarUrl?: string;  
  rating: number;  
  comment: string;  
  date: string;  
  sourcePlatform: 'Google' | 'Facebook' | 'Trustpilot';  
}

interface ElfsightReviewsGuardProps {  
  widgetId: string;  
  fallbackReviews: StaticReview;  
  mobileHeight?: number;  
  desktopHeight?: number;  
  /\*\* Tiempo límite de espera en milisegundos para declarar fallo de carga. \*/  
  timeoutThreshold?: number;  
}

export function ElfsightReviewsGuard({  
  widgetId,  
  fallbackReviews,  
  mobileHeight \= 350,  
  desktopHeight \= 450,  
  timeoutThreshold \= 3500,  
}: ElfsightReviewsGuardProps): React.JSX.Element {  
  const \[isMounted, setIsMounted\] \= useState\<boolean\>(false);  
  const \= useState\<boolean\>(false);  
  const \[hasFailed, setHasFailed\] \= useState\<boolean\>(false);  
  const containerRef \= useRef\<HTMLDivElement\>(null);

  useEffect(() \=\> {  
    setIsMounted(true);  
  },);

  useEffect(() \=\> {  
    if (\!isMounted ||\!isScriptLoaded) return;

    let pollingInterval: NodeJS.Timeout;  
      
    // Configura un temporizador límite para auditar el estado del Shadow DOM de Elfsight.  
    const safetyTimeout \= setTimeout(() \=\> {  
      const hostElement \= containerRef.current?.querySelector(\`.elfsight-app-${widgetId}\`);  
      if (hostElement) {  
        const shadow \= hostElement.shadowRoot;  
          
        // El widget se considera caído si el Shadow DOM no existe, no posee elementos hijos  
        // o si contiene estructuras características del banner de cuota excedida.  
        const isEmpty \=\!shadow || shadow.children.length \=== 0 || shadow.innerHTML.trim() \=== '';  
        const isQuotaExceeded \= shadow?.querySelector('\[class\*="deactivated"\]')\!== null ||   
                                shadow?.innerHTML.includes('Widget deactivated') \=== true;

        if (isEmpty || isQuotaExceeded) {  
          setHasFailed(true);  
        }  
      } else {  
        setHasFailed(true);  
      }  
    }, timeoutThreshold);

    // Sondeo periódico opcional durante la ventana de tiempo para capturar la inyección temprana.  
    pollingInterval \= setInterval(() \=\> {  
      const hostElement \= containerRef.current?.querySelector(\`.elfsight-app-${widgetId}\`);  
      if (hostElement && hostElement.shadowRoot) {  
        const shadow \= hostElement.shadowRoot;  
        const hasContent \= shadow.children.length \> 0 &&\!shadow.innerHTML.includes('Widget deactivated');  
        if (hasContent) {  
          // El widget cargó correctamente, cancelamos las alarmas de fallo.  
          clearTimeout(safetyTimeout);  
          clearInterval(pollingInterval);  
        }  
      }  
    }, 250);

    return () \=\> {  
      clearTimeout(safetyTimeout);  
      clearInterval(pollingInterval);  
    };  
  },);

  if (\!isMounted) {  
    return (  
      \<div   
        style={{ '--desktop-h': \`${desktopHeight}px\` } as React.CSSProperties}  
        className="w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 min-h-\[var(--desktop-h)\] animate-pulse"   
      /\>  
    );  
  }

  return (  
    \<div   
      ref={containerRef}   
      style={{  
        '--mobile-h': \`${mobileHeight}px\`,  
        '--desktop-h': \`${desktopHeight}px\`,  
      } as React.CSSProperties}  
      className="w-full"  
    \>  
      {\!hasFailed? (  
        \<div className="relative w-full min-h-\[var(--mobile-h)\] md:min-h-\[var(--desktop-h)\]"\>  
          {/\* Esqueleto visual de reserva \*/}  
          {\!isScriptLoaded && (  
            \<div className="absolute inset-0 w-full flex flex-col justify-between p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 animate-pulse"\>  
              \<div className="flex items-center gap-4"\>  
                \<div className="size-12 rounded-full bg-neutral-200 dark:bg-neutral-800" /\>  
                \<div className="flex-1 space-y-2"\>  
                  \<div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
                  \<div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
                \</div\>  
              \</div\>  
              \<div className="space-y-3 my-6 flex-1 justify-center flex flex-col"\>  
                \<div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" /\>  
                \<div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" /\>  
              \</div\>  
              \<div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" /\>  
            \</div\>  
          )}

          {/\* Divisor de inserción de Elfsight \*/}  
          \<div className={\`elfsight-app-${widgetId}\`} /\>

          \<Script  
            src="https://static.elfsight.com/platform/platform.js"  
            strategy="lazyOnload"  
            data-use-service-core  
            onLoad={() \=\> setIsScriptLoaded(true)}  
            onError={() \=\> setHasFailed(true)}  
          /\>  
        \</div\>  
      ) : (  
        /\* Fallback robusto nativo: Carrusel interactivo mediante Radix UI y Tailwind CSS v4 \*/  
        \<div className="w-full p-6 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 transition-opacity duration-500"\>  
          \<div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"\>  
            \<div\>  
              \<h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50"\>Reseñas de Clientes\</h3\>  
              \<p className="text-sm text-neutral-500 dark:text-neutral-400"\>Pruebas sociales consolidadas de canales oficiales\</p\>  
            \</div\>  
            \<div className="flex items-center gap-2"\>  
              \<span className="text-3xl font-black text-neutral-900 dark:text-neutral-50"\>4.8\</span\>  
              \<div className="flex text-amber-500"\>  
                {Array.from({ length: 5 }).map((\_, i) \=\> (  
                  \<svg key={i} className="size-5 fill-current" viewBox="0 0 20 20"\>  
                    \<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /\>  
                  \</svg\>  
                ))}  
              \</div\>  
            \</div\>  
          \</div\>

          \<ScrollArea.Root className="w-full overflow-hidden" type="hover"\>  
            \<ScrollArea.Viewport className="w-full rounded-xl overflow-x-auto pb-4"\>  
              \<div className="flex w-max gap-6"\>  
                {fallbackReviews.map((review) \=\> (  
                  \<div  
                    key={review.id}  
                    className="flex flex-col justify-between w-\[300px\] sm:w-\[350px\] min-h-\[220px\] p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-900 select-none"  
                  \>  
                    \<div className="flex justify-between items-start"\>  
                      \<div className="flex gap-3"\>  
                        {review.avatarUrl? (  
                          \<img  
                            src={review.avatarUrl}  
                            alt={review.authorName}  
                            className="size-10 rounded-full object-cover"  
                          /\>  
                        ) : (  
                          \<div className="size-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-400"\>  
                            {review.authorName.slice(0, 2).toUpperCase()}  
                          \</div\>  
                        )}  
                        \<div\>  
                          \<h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50"\>{review.authorName}\</h4\>  
                          \<span className="text-xs text-neutral-400 dark:text-neutral-500"\>{review.date}\</span\>  
                        \</div\>  
                      \</div\>  
                      \<span className="px-2 py-0.5 text-\[10px\] font-bold rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"\>  
                        {review.sourcePlatform}  
                      \</span\>  
                    \</div\>

                    \<div className="flex text-amber-500 my-3"\>  
                      {Array.from({ length: review.rating }).map((\_, idx) \=\> (  
                        \<svg key={idx} className="size-4 fill-current" viewBox="0 0 20 20"\>  
                          \<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /\>  
                        \</svg\>  
                      ))}  
                    \</div\>

                    \<p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-4 overflow-hidden text-ellipsis"\>  
                      {review.comment}  
                    \</p\>  
                  \</div\>  
                ))}  
              \</div\>  
            \</ScrollArea.Viewport\>

            {/\* Barra de desplazamiento nativa y estilizada de Radix ScrollArea \*/}  
            \<ScrollArea.ScrollAreaScrollbar  
              orientation="horizontal"  
              className="flex select-none touch-none p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-full h-2 transition-colors duration-150"  
            \>  
              \<ScrollArea.ScrollAreaThumb className="flex-1 bg-neutral-300 dark:bg-neutral-700 rounded-full transition-colors hover:bg-neutral-400 dark:hover:bg-neutral-600" /\>  
            \</ScrollArea.ScrollAreaScrollbar\>  
          \</ScrollArea.Root\>  
        \</div\>  
      )}  
    \</div\>  
  );  
}

## **Síntesis de recomendaciones y buenas prácticas**

La implementación óptima de este sistema de visualización híbrida garantiza inmunidad frente al agotamiento de recursos del plan gratuito de Elfsight y optimiza la experiencia del usuario.1

* **Alineación con Core Web Vitals:** Al posponer de forma sistemática la descarga del script mediante strategy="lazyOnload", se salvaguarda la respuesta reactiva de la aplicación principal ante la interacción física del usuario (INP).3  
* **Contención del CLS:** La parametrización estricta del contenedor responsivo anula las oscilaciones súbitas de los nodos DOM inferiores al descargar la biblioteca.7  
* **Resiliencia Operativa:** El componente híbrido ElfsightReviewsGuard asegura la presencia de datos comerciales mediante el carrusel de respaldo de Radix UI, neutralizando por completo el riesgo de desactivaciones imprevistas por picos puntuales de tráfico que agoten la cuota del plan de Elfsight.1

#### **Obras citadas**

1. View Limit: Everything You Need to Know \- Elfsight Help Center, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1089-views-limit-everything-you-need-to-know-new-dashboard](https://help.elfsight.com/article/1089-views-limit-everything-you-need-to-know-new-dashboard)  
2. I tested 8 Elfsight alternatives worth switching to (2026) \- WiserReview, fecha de acceso: junio 4, 2026, [https://wiserreview.com/blog/elfsight-alternatives/](https://wiserreview.com/blog/elfsight-alternatives/)  
3. Fix Third Party Scripts in Next.js for Better Core Web Vitals, fecha de acceso: junio 4, 2026, [https://www.corewebvitals.io/pagespeed/nextjs-fix-third-pary-scripts](https://www.corewebvitals.io/pagespeed/nextjs-fix-third-pary-scripts)  
4. Components: Script | Next.js, fecha de acceso: junio 4, 2026, [https://nextjs.org/docs/pages/api-reference/components/script](https://nextjs.org/docs/pages/api-reference/components/script)  
5. Third‑Party Scripts | Vercel Academy, fecha de acceso: junio 4, 2026, [https://vercel.com/academy/nextjs-foundations/third-party-scripts](https://vercel.com/academy/nextjs-foundations/third-party-scripts)  
6. Guides: Scripts | Next.js, fecha de acceso: junio 4, 2026, [https://nextjs.org/docs/pages/guides/scripts](https://nextjs.org/docs/pages/guides/scripts)  
7. Adding Elfsight widget to Ecwid website, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/897-how-to-add-elfsight-widget-to-ecwid-website](https://help.elfsight.com/article/897-how-to-add-elfsight-widget-to-ecwid-website)  
8. Shadow DOM: Building Perfectly Encapsulated Web Components \- DEV Community, fecha de acceso: junio 4, 2026, [https://dev.to/mukhilpadmanabhan/shadow-dom-building-perfectly-encapsulated-web-components-441f](https://dev.to/mukhilpadmanabhan/shadow-dom-building-perfectly-encapsulated-web-components-441f)  
9. Shadow DOM 101 | Articles \- web.dev, fecha de acceso: junio 4, 2026, [https://web.dev/articles/shadowdom](https://web.dev/articles/shadowdom)  
10. Responsive All-in-One Reviews widget \- Lots of Amazing features \- Elfsight, fecha de acceso: junio 4, 2026, [https://elfsight.com/all-in-one-reviews-widget/features/](https://elfsight.com/all-in-one-reviews-widget/features/)  
11. How to Customize the Appearance of your Reviews Widget \- Elfsight Help Center, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1537-how-to-customize-the-appearance-of-the-reviews-widget](https://help.elfsight.com/article/1537-how-to-customize-the-appearance-of-the-reviews-widget)  
12. Tailwind CSS v4.0, fecha de acceso: junio 4, 2026, [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)  
13. Guide to CSS Codes for Elfsight Widgets, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1593-guide-to-css-codes-for-elfsight-widgets](https://help.elfsight.com/article/1593-guide-to-css-codes-for-elfsight-widgets)  
14. How to lazy loading Elfsight Widgets \- Beyondspace, fecha de acceso: junio 4, 2026, [https://www.beyondspace.studio/blog/how-to-lazy-load-elfsight-widgets](https://www.beyondspace.studio/blog/how-to-lazy-load-elfsight-widgets)  
15. Shopify Liquid fine in Editor (Absent in published) \- General Questions \- Elfsight Community, fecha de acceso: junio 4, 2026, [https://community.elfsight.com/t/shopify-liquid-fine-in-editor-absent-in-published/40585](https://community.elfsight.com/t/shopify-liquid-fine-in-editor-absent-in-published/40585)  
16. Why my widget doesn't display on my site until page refresh \- Elfsight Help, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/791-ajax-issue](https://help.elfsight.com/article/791-ajax-issue)  
17. ShadowRoot \- Web APIs | MDN, fecha de acceso: junio 4, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)  
18. Digging Deeper into Why Web Components and Tailwind CSS Don't Play Well Together, fecha de acceso: junio 4, 2026, [https://blog.kinto-technologies.com/posts/2025-07-14-web-components-and-tailwind-css-dont-mix-en/](https://blog.kinto-technologies.com/posts/2025-07-14-web-components-and-tailwind-css-dont-mix-en/)  
19. How to use parent CSS from Shadow DOM \- Stack Overflow, fecha de acceso: junio 4, 2026, [https://stackoverflow.com/questions/49392066/how-to-use-parent-css-from-shadow-dom](https://stackoverflow.com/questions/49392066/how-to-use-parent-css-from-shadow-dom)  
20. Styling Components \- Stencil.js, fecha de acceso: junio 4, 2026, [https://stenciljs.com/docs/styling](https://stenciljs.com/docs/styling)  
21. Using CSS custom properties (variables) \- MDN Web Docs, fecha de acceso: junio 4, 2026, [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading\_variables/Using\_custom\_properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)  
22. Guide to CSS Codes \- Help Center \- Elfsight Community, fecha de acceso: junio 4, 2026, [https://community.elfsight.com/t/guide-to-css-codes/140803](https://community.elfsight.com/t/guide-to-css-codes/140803)  
23. Adding a CSS code to Elfsight app from Shopify App Store, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1077-how-to-add-a-css-code-to-sh-elfsight-app](https://help.elfsight.com/article/1077-how-to-add-a-css-code-to-sh-elfsight-app)  
24. Tailwind CSS v4 and the Shadow DOM | Meefik's Blog, fecha de acceso: junio 4, 2026, [https://meefik.dev/2025/03/19/tailwindcss-and-shadow-dom/](https://meefik.dev/2025/03/19/tailwindcss-and-shadow-dom/)  
25. v4: define all Tailwind CSS Variables using ":root, :host" selector for Shadow DOM compatibility · tailwindlabs tailwindcss · Discussion \#15556 · GitHub, fecha de acceso: junio 4, 2026, [https://github.com/tailwindlabs/tailwindcss/discussions/15556](https://github.com/tailwindlabs/tailwindcss/discussions/15556)  
26. Element: shadowRoot property \- Web APIs \- MDN Web Docs, fecha de acceso: junio 4, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot)  
27. ShadowRoot: mode property \- Web APIs | MDN, fecha de acceso: junio 4, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode)  
28. Installing Elfsight widget on Wix avoiding iFrame via Custom Element, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1533-installing-elfsight-widget-on-wix-avoiding-iframe-via-custom-element](https://help.elfsight.com/article/1533-installing-elfsight-widget-on-wix-avoiding-iframe-via-custom-element)  
29. The views in a month \- General Questions \- Elfsight Community, fecha de acceso: junio 4, 2026, [https://community.elfsight.com/t/the-views-in-a-month/130187](https://community.elfsight.com/t/the-views-in-a-month/130187)  
30. Why My Widget Isn't Displayed on My Website \- Elfsight Help Center, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/1581-why-my-widget-doesnt-display-on-my-website](https://help.elfsight.com/article/1581-why-my-widget-doesnt-display-on-my-website)  
31. Why my widget has been deactivated \- Elfsight Help Center, fecha de acceso: junio 4, 2026, [https://help.elfsight.com/article/695-my-widget-is-deactivated-views-expired](https://help.elfsight.com/article/695-my-widget-is-deactivated-views-expired)  
32. Grid View Customization \- \#11 by DustinVance \- Elfsight Community, fecha de acceso: junio 4, 2026, [https://community.elfsight.com/t/grid-view-customization/90738/11](https://community.elfsight.com/t/grid-view-customization/90738/11)  
33. \[Shadcn/ui React Series — Part 9\] Scroll Area: Controlled Scrolling Without Layout Hacks, fecha de acceso: junio 4, 2026, [https://javascript.plainenglish.io/shadcn-ui-react-series-part-9-scroll-area-controlled-scrolling-without-layout-hacks-4263c6f899f4](https://javascript.plainenglish.io/shadcn-ui-react-series-part-9-scroll-area-controlled-scrolling-without-layout-hacks-4263c6f899f4)  
34. Scroll Area \- Shadcn UI, fecha de acceso: junio 4, 2026, [https://ui.shadcn.com/docs/components/radix/scroll-area](https://ui.shadcn.com/docs/components/radix/scroll-area)