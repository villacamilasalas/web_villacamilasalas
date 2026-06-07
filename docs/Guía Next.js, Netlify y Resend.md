# **Guía de Arquitectura e Implementación: Infraestructura de Correo de Alta Entregabilidad con Next.js, Resend y Netlify en la Capa Gratuita (Hobby Tier)**

La implementación de un sistema de comunicación por correo electrónico altamente entregable y seguro es un pilar fundamental para las aplicaciones web modernas. En entornos de producción profesionales que operan bajo restricciones presupuestarias estrictas, la combinación del framework Next.js, el proveedor de infraestructura de correo Resend y la plataforma de despliegue Netlify ofrece una solución robusta y completamente viable dentro de sus respectivas capas gratuitas (Hobby Tier).1 Esta guía técnica detalla la arquitectura, configuración y patrones de diseño necesarios para desplegar un sistema de formulario de contacto con validación server-side, protección contra correo basura (SPAM) y control de variables de entorno sin exponer secretos en el cliente.4

## **Configuración de Resend y Autenticación del Dominio**

La entregabilidad del correo electrónico está supeditada a dos factores críticos: la reputación del dominio remitente y la autenticación criptográfica de los mensajes.7 Sin una configuración de DNS adecuada, los principales proveedores de correo (como Gmail y Yahoo) clasificarán los mensajes salientes como SPAM de forma automática, independientemente de la legitimidad de su contenido.7  
Para validar un dominio en Resend, no es posible utilizar dominios públicos o compartidos (como @gmail.com o @yahoo.com); se requiere la propiedad de un dominio personalizado.9 Aunque se puede autenticar el dominio raíz (APEX), se recomienda encarecidamente utilizar un subdominio específico (por ejemplo, mail.midominio.com o notificaciones.midominio.com) con el fin de aislar la reputación de envío y proteger el tráfico de correo corporativo principal.9  
La delegación de permisos a Resend se consolida mediante la adición de registros específicos en el proveedor de DNS (como Cloudflare, GoDaddy o Vercel).10 A continuación, se detalla la matriz de registros necesarios para lograr la plena conformidad de los protocolos SPF, DKIM y DMARC.9

| Tipo de Registro | Nombre / Host | Valor / Destino | Propósito Técnico |
| :---- | :---- | :---- | :---- |
| **TXT** | @ (o apex) | v=spf1 include:\_spf.resend.com \-all | **SPF**: Autoriza a los servidores de Resend a enviar correos en nombre del dominio.7 |
| **CNAME** | resend.\_domainkey | resend.\_domainkey.resend.com | **DKIM**: Proporciona la clave pública para verificar la firma criptográfica del mensaje.7 |
| **TXT** | \_dmarc | v=DMARC1; p=none; rua=mailto:dmarcreports@midominio.com; | **DMARC**: Define la política de alineación y habilita informes de fallos de autenticación.11 |
| **MX** | feedback | feedback-smtp.resend.com (Prioridad: 10\) | **Ruta de Retorno (MX)**: Canaliza los rebotes y quejas de vuelta a la infraestructura de Resend.9 |

### **Análisis Detallado de los Protocolos de Seguridad**

El registro SPF define la política de remitentes autorizados.7 El uso del calificador \-all (Hard Fail) en lugar de \~all (Soft Fail) es crucial para establecer una postura de seguridad estricta.7 El parámetro \-all instruye explícitamente a los servidores receptores a rechazar de inmediato cualquier correo que intente suplantar el dominio si no proviene de las IPs autorizadas de Resend.7  
El protocolo DKIM mitiga la manipulación de mensajes durante el tránsito mediante firmas criptográficas adjuntas a las cabeceras.9 El receptor consulta el registro DNS tipo CNAME para obtener la clave pública y descifrar la firma, asegurando que el cuerpo y los adjuntos del correo no sufrieron modificaciones desde su despacho.7  
DMARC actúa como la capa de gobernanza sobre SPF y DKIM.10 La implementación recomendada para entornos de producción sigue una estrategia evolutiva de tres fases basada en la directiva de política (p) 11:

1. **Fase de Monitoreo (p=none)**: Permite que todos los correos se entreguen normalmente, recopilando informes XML de fallos de alineación en la dirección especificada en la etiqueta rua.11 Esta fase debe sostenerse durante varias semanas para identificar todas las fuentes legítimas de correo del dominio.11  
2. **Fase de Cuarentena (p=quarantine)**: Incrementa la seguridad instruyendo a los proveedores de correo a desviar a la carpeta de correo no deseado (SPAM) aquellos correos que fallen las pruebas de alineación SPF o DKIM.11  
3. **Fase de Rechazo Estricto (p=reject)**: Bloquea por completo la entrega de correos no alineados, logrando la máxima protección contra la suplantación de identidad (spoofing).11

### **Obtención Segura de la API Key en Resend**

Una vez propagados y verificados los registros DNS en el panel de Resend (proceso que puede demorar hasta 72 horas en completarse en la red global de servidores de nombres) 9, se procede a generar la clave de interfaz de programación de aplicaciones (API Key).13 En el panel de control de Resend, en la sección de configuraciones de credenciales, se debe crear una API Key limitando su alcance únicamente al rol de envío de correos ("Sending Access").14 Es una violación grave de los principios de seguridad de la nube otorgar permisos de administración completa ("Full Access") a una clave destinada a la integración del código de producción.4

## **Integración Segura con Next.js 15 utilizando Server Actions**

El modelo de computación de Next.js 15, alineado con las especificaciones de React 19, promueve el uso de Server Actions para gestionar interacciones de datos directamente en el servidor sin necesidad de exponer rutas de API (API Routes) tradicionales.4 Este modelo garantiza que la lógica de negocio y las credenciales de terceros permanezcan del lado del servidor, reduciendo sustancialmente la superficie de ataque del cliente.4

### **Arquitectura de Validación y Defensa contra Bots**

Para construir un formulario de contacto profesional, no basta con depender de validaciones en el navegador mediante atributos de HTML5 (como required o type="email") debido a la facilidad con la que pueden ser eludidos mediante la consola de desarrollo o scripts automatizados.17 Se requiere validación del lado del servidor utilizando una biblioteca robusta como Zod para garantizar la integridad de los tipos de datos.3  
Además, para neutralizar el correo basura masivo sin degradar la experiencia de usuario con retos visuales molestos (CAPTCHAs), se implementa una trampa Honeypot.6 Esta técnica consiste en posicionar un campo de entrada oculto mediante CSS.6 Los usuarios legítimos no interactúan con él, pero los bots automatizados de rastreo tienden a rellenar sistemáticamente todos los campos disponibles en el árbol del DOM.6 Si al procesar el formulario en el servidor este campo contiene información, se clasifica de inmediato como un ataque de spam y se simula una entrega exitosa para evitar dar pistas al script atacante.21

### **Implementación del Código del Servidor (Server Action)**

El siguiente fragmento de código TypeScript define el esquema de validación, la detección de bots y el flujo de envío de correo en el servidor.16

TypeScript  
// src/app/actions.ts  
"use server";

import { z } from "zod";  
import { Resend } from "resend";

// Definición estricta de la estructura esperada utilizando Zod  
const ContactFormSchema \= z.object({  
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),  
  correo: z.string().email({ message: "Por favor, introduzca un correo electrónico válido." }),  
  mensaje: z.string().min(10, { message: "El mensaje debe contener al menos 10 caracteres." }),  
});

// Definición de tipos de estado para el control en el cliente  
export type FormState \= {  
  exito: boolean;  
  errores?: {  
    nombre?: string;  
    correo?: string;  
    mensaje?: string;  
  };  
  mensajeGlobal?: string | null;  
};

// Inicialización de la instancia de Resend con la clave de entorno del servidor  
const resend \= new Resend(process.env.RESEND\_API\_KEY);

export async function enviarFormularioContacto(  
  prevState: FormState,  
  formData: FormData  
): Promise\<FormState\> {  
  // 1\. Verificación Honeypot: 'organizacion' es un campo invisible para humanos  
  const honeypot \= formData.get("organizacion");  
  if (honeypot && honeypot.toString().trim()\!== "") {  
    // Retorno silencioso de éxito para engañar al bot sin consumir la cuota de la API  
    return {  
      exito: true,  
      mensajeGlobal: "El mensaje ha sido procesado de manera correcta.",  
    };  
  }

  // 2\. Extracción y parseo seguro de datos del formulario  
  const datosCrudos \= {  
    nombre: formData.get("nombre"),  
    correo: formData.get("correo"),  
    mensaje: formData.get("mensaje"),  
  };

  const resultadoValidacion \= ContactFormSchema.safeParse(datosCrudos);

  if (\!resultadoValidacion.success) {  
    return {  
      exito: false,  
      errores: resultadoValidacion.error.flatten().fieldErrors,  
      mensajeGlobal: "Error en la validación de los datos suministrados.",  
    };  
  }

  const { nombre, correo, mensaje } \= resultadoValidacion.data;

  try {  
    // 3\. Ejecución del envío mediante el SDK de Resend  
    const { data, error } \= await resend.emails.send({  
      from: "Formulario de Contacto \<contacto@midominio.com\>", // Debe ser un dominio verificado  
      to: \["destino@midominio.com"\],  
      replyTo: correo,  
      subject: \`Nuevo mensaje de ${nombre}\`,  
      html: \`  
        \<div style="font-family: Arial, sans-serif; padding: 20px; color: \#333;"\>  
          \<h2 style="color: \#0056b3;"\>Nueva solicitud de información\</h2\>  
          \<p\>\<strong\>Nombre del remitente:\</strong\> ${nombre}\</p\>  
          \<p\>\<strong\>Correo electrónico:\</strong\> ${correo}\</p\>  
          \<hr style="border: 0; border-top: 1px solid \#ccc; margin: 20px 0;" /\>  
          \<p\>\<strong\>Mensaje:\</strong\>\</p\>  
          \<div style="background-color: \#f9f9f9; padding: 15px; border-left: 4px solid \#0056b3;"\>  
            ${mensaje.replace(/\\n/g, "\<br\>")}  
          \</div\>  
        \</div\>  
      \`,  
    });

    if (error) {  
      console.error("Fallo reportado por el servidor de Resend:", error);  
      return {  
        exito: false,  
        mensajeGlobal: "El servidor de correo rechazó la transacción de envío.",  
      };  
    }

    return {  
      exito: true,  
      mensajeGlobal: "Su mensaje ha sido enviado satisfactoriamente.",  
    };  
  } catch (err) {  
    console.error("Excepción inesperada en tiempo de ejecución:", err);  
    return {  
      exito: false,  
      mensajeGlobal: "Ocurrió una anomalía crítica interna al intentar procesar la acción.",  
    };  
  }  
}

### **Implementación del Código del Cliente (Componente de React)**

A continuación, se presenta el componente de interfaz de usuario de React que se enlaza con la acción del servidor utilizando el hook useActionState de React 19\.16

TypeScript  
// src/components/FormularioContacto.tsx  
"use client";

import { useActionState } from "react";  
import { enviarFormularioContacto, FormState } from "@/app/actions";

const estadoInicial: FormState \= {  
  exito: false,  
  errores: {},  
  mensajeGlobal: null,  
};

export function FormularioContacto() {  
  // Vinculación de la acción del servidor y captura de estados reactivos  
  const \[state, ejecutarAccion, estaCargando\] \= useActionState(  
    enviarFormularioContacto,  
    estadoInicial  
  );

  return (  
    \<form action={ejecutarAccion} className="max-w-md mx-auto p-6 bg-slate-50 rounded-lg shadow-md space-y-4" noValidate\>  
        
      {/\* Campo Honeypot \- Oculto visualmente y retirado de la navegación por teclado \*/}  
      \<div className="hidden" aria-hidden="true"\>  
        \<label htmlFor="organizacion"\>Organización\</label\>  
        \<input  
          id="organizacion"  
          type="text"  
          name="organizacion"  
          tabIndex={-1}  
          autoComplete="one-time-code"  
        /\>  
      \</div\>

      {/\* Nombre \*/}  
      \<div className="flex flex-col"\>  
        \<label htmlFor="nombre" className="text-sm font-medium text-slate-700"\>Nombre Completo\</label\>  
        \<input  
          id="nombre"  
          type="text"  
          name="nombre"  
          required  
          disabled={estaCargando}  
          className="mt-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200"  
        /\>  
        {state.errores?.nombre && (  
          \<p className="text-red-600 text-xs mt-1" role="alert"\>{state.errores.nombre}\</p\>  
        )}  
      \</div\>

      {/\* Correo Electrónico \*/}  
      \<div className="flex flex-col"\>  
        \<label htmlFor="correo" className="text-sm font-medium text-slate-700"\>Correo Electrónico\</label\>  
        \<input  
          id="correo"  
          type="email"  
          name="correo"  
          required  
          disabled={estaCargando}  
          className="mt-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200"  
        /\>  
        {state.errores?.correo && (  
          \<p className="text-red-600 text-xs mt-1" role="alert"\>{state.errores.correo}\</p\>  
        )}  
      \</div\>

      {/\* Mensaje \*/}  
      \<div className="flex flex-col"\>  
        \<label htmlFor="mensaje" className="text-sm font-medium text-slate-700"\>Mensaje de Consulta\</label\>  
        \<textarea  
          id="mensaje"  
          name="mensaje"  
          required  
          rows={4}  
          disabled={estaCargando}  
          className="mt-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200"  
        /\>  
        {state.errores?.mensaje && (  
          \<p className="text-red-600 text-xs mt-1" role="alert"\>{state.errores.mensaje}\</p\>  
        )}  
      \</div\>

      {/\* Botón de Envío \*/}  
      \<button  
        type="submit"  
        disabled={estaCargando}  
        className="w-full py-2 px-4 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800 disabled:bg-slate-400 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"  
      \>  
        {estaCargando? "Transmitiendo datos..." : "Enviar Solicitud"}  
      \</button\>

      {/\* Mensaje Informativo Global \*/}  
      {state.mensajeGlobal && (  
        \<div  
          className={\`p-3 rounded text-sm text-center ${  
            state.exito? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"  
          }\`}  
          role="status"  
        \>  
          {state.mensajeGlobal}  
        \</div\>  
      )}  
    \</form\>  
  );  
}

## **Seguridad de Variables de Entorno en Netlify**

El aislamiento de los secretos de la aplicación frente a fugas accidentales hacia el cliente de la aplicación web se rige por convenciones estrictas de Next.js y configuraciones precisas de la infraestructura de alojamiento en la nube.18

### **El Riesgo Caimán del Prefijo NEXT\_PUBLIC\_**

En el ecosistema Next.js, cualquier variable de entorno que lleve el prefijo NEXT\_PUBLIC\_ (por ejemplo, NEXT\_PUBLIC\_RESEND\_API\_KEY) es interceptada por el compilador de Next.js durante la fase de empaquetado (next build).5 El compilador reemplaza directamente en el código de producción las referencias de texto por el valor explícito de la variable, incrustándolo directamente en los archivos de JavaScript públicos distribuidos al navegador web del cliente.18  
Cualquier usuario con acceso a las herramientas de desarrollo del navegador o que analice las peticiones de red podría extraer la API Key e interceptar el derecho de envío de correo electrónico, utilizándola para propagar campañas de phishing o agotar por completo el plan de Resend de la organización.14 Al omitir el prefijo y registrar la clave simplemente como RESEND\_API\_KEY, Next.js bloquea la exposición en el cliente.5 La variable solo es accesible en entornos de Node.js (el backend del servidor o las funciones serverless instantáneas).5

### **Configuración Paso a Paso en Netlify**

La gestión de las variables de entorno en Netlify debe realizarse exclusivamente a través de su consola de administración centralizada, garantizando que no se suban archivos de configuración locales (como .env.local) al sistema de control de versiones de Git.5  
La secuencia de aseguramiento del secreto se realiza mediante los siguientes pasos administrativos en la interfaz web de Netlify:

1. Se accede al panel de control de **Netlify** y se selecciona el proyecto correspondiente.  
2. Se navega secuencialmente a través de las pestañas **Site configuration** y luego a **Environment variables**.5  
3. Se pulsa el botón **Add a variable** y se opta por la opción **Add single variable**.24  
4. Se introduce RESEND\_API\_KEY en el campo del identificador (**Key**) y se pega el token criptográfico obtenido en el panel de Resend en el campo de valor (**Value**).24  
5. Se despliega la configuración avanzada para definir los alcances de seguridad (**Scopes**), marcando únicamente las opciones **Builds** (para inyección durante procesos de compilación) y **Functions** (vital para el runtime de las Server Actions y las funciones API de Netlify).24 Se deben desmarcar de forma explícita los alcances de **Runtime** y **Post-processing** para evitar cualquier exposición accidental en navegadores.24  
6. Se habilita la opción **Contains secret values** (proporcionado por el Secrets Controller de Netlify), ocultando de forma permanente los valores en la consola a cualquier miembro del equipo que no cuente con credenciales administrativas directas.24

## **Optimización de Recursos y Límites de la Capa Hobby**

Trabajar eficazmente dentro de las limitaciones financieras de un presupuesto de cero dólares requiere una comprensión rigurosa de las cuotas y los sistemas de penalización de uso de ambas plataformas.1

### **Límites de los Recursos en Capas Gratuitas**

La planificación de capacidades para mantener la disponibilidad del servicio debe basarse en los límites estipulados por ambas plataformas.1

| Recurso de Netlify (Free Plan) | Límite Máximo Mensual | Comportamiento / Acción al Exceder el Límite |
| :---- | :---- | :---- |
| **Créditos Mensuales** | 300 créditos de cómputo 27 | Límite estricto sin auto-recarga.27 |
| **Ancho de Banda** | 100 GB 1 | Suspensión temporal del sitio hasta el próximo ciclo.1 |
| **Minutos de Construcción** | 300 minutos 1 | Pausa de nuevas compilaciones (las fallidas también restan).29 |
| **Invocaciones de Funciones** | 125,000 ejecuciones 1 | Detención temporal del servicio de Server Actions.1 |
| **Invocaciones de Edge** | 1,000,000 ejecuciones 1 | Detención temporal de las llamadas de borde.1 |
| **Compilaciones Concurrentes** | 1 proceso activo 27 | Encolamiento de compilaciones consecutivas.27 |

| Recurso de Resend (Free Tier) | Límite Máximo de Operación | Comportamiento / Acción al Exceder el Límite |
| :---- | :---- | :---- |
| **Cupo de Envío Mensual** | 3,000 correos 2 | Bloqueo absoluto de envío; retorno de error 429\.14 |
| **Cupo de Envío Diario** | 100 correos (Restricción principal) 2 | Rechazo inmediato de peticiones de envío; retorno de error 429\.14 |
| **Tasa de Peticiones API** | 5 peticiones por segundo (Compartido) 14 | Throttling de peticiones adicionales con error 429\.14 |
| **Dominios Autorizados** | 1 dominio de envío 2 | Restricción dura en el panel del plan gratuito.2 |
| **Historial de Logs** | 30 días de retención de eventos 2 | Eliminación secuencial automática de logs de envío.2 |

### **Señales de Alerta y Estrategias de Monitoreo Activo**

La interrupción inesperada del servicio web debido al agotamiento de las cuotas puede mitigarse mediante la monitorización proactiva de señales clave de consumo.1  
Para monitorizar y controlar las cuotas se deben aplicar las siguientes medidas técnicas:

* **Monitoreo del Consumo Diario de Correo**: Resend devuelve en las cabeceras HTTP de respuesta de cada envío exitoso el estado de consumo mediante los parámetros x-resend-daily-quota y x-resend-monthly-quota.14 En las Server Actions se debe programar un mecanismo para loguear o alertar internamente si el valor restante de la cuota diaria se aproxima a niveles críticos.14  
* **Tratamiento del Límite de Peticiones por Segundo (Rate Limits)**: Para ráfagas de tráfico repentinas que superen las 5 peticiones/segundo, la Server Action debe capturar el error 429 de Resend.14 Los encabezados retry-after y ratelimit-reset de Resend indican con precisión el tiempo de espera requerido antes de reintentar la llamada.14  
* **Optimización de Minutos de Construcción en Netlify**: Netlify consume minutos de compilación por cada confirmación (commit) subida al repositorio.29 Se recomienda inhabilitar las compilaciones automáticas de ramas secundarias y las vistas previas de despliegues (Deploy Previews) de las pull requests en proyectos no críticos, concentrando el cómputo únicamente en la rama principal de producción.29 Asimismo, la caché interna de dependencias de Netlify debe estar activa para evitar descargar paquetes desde cero en cada ciclo.29

## **Análisis del Flujo de Trabajo y Superioridad Arquitectónica**

El tránsito seguro de los datos de contacto enviados por el usuario sigue un flujo estructurado desde el navegador hasta la bandeja de entrada, garantizando la consistencia y la protección de los datos en cada etapa del trayecto.

\[Navegador del Cliente\]  
       │  
       ▼ (1) Envió de datos del formulario (Nombre, Correo, Mensaje, Honeypot)  
 (Verifica el origen CSRF de la petición)  
       │  
       ▼ (2) Ejecución segura de la Server Action en entorno serverless  
 (Invalida bots con Honeypot / Valida con Zod)  
       │  
       ▼ (3) Recuperación segura de RESEND\_API\_KEY en memoria de ejecución

       │  
       ▼ (4) Envío de carga cifrada a la API de Resend  
 (Firma criptográfica DKIM y alineación SPF)  
       │  
       ▼ (5) Comprobación de alineación DMARC en buzón receptor

La superioridad de este enfoque frente a las soluciones basadas exclusivamente en el cliente (como EmailJS u otras bibliotecas de envío directo desde el navegador) radica principalmente en la eliminación de la exposición de secretos y la centralización de las políticas de validación.5  
A continuación, se detalla un análisis comparativo de ambas metodologías.5

| Criterio de Arquitectura | Next.js Server Actions \+ Resend | Soluciones 'Solo Cliente' (EmailJS) |
| :---- | :---- | :---- |
| **Protección de Credenciales** | Máxima. Las claves de API residen de forma aislada en el servidor y nunca viajan al navegador.4 | Nula. Los tokens de servicio o identificadores públicos de cliente quedan expuestos en la red del navegador.18 |
| **Validación de Carga Útil** | Inviolable. Zod valida la integridad de los datos de forma robusta en el servidor antes de activar cualquier API.17 | Vulnerable. Las validaciones pueden desactivarse manipulando el código del lado del cliente.17 |
| **Defensa Anti-Spam** | Avanzada. Integra trampas Honeypot silenciosas del lado del servidor y previene llamadas de cuota innecesarias.6 | Débil. Depende de servicios externos de CAPTCHA invasivos o validaciones frágiles en JS local.6 |
| **Protección de Cuota Financiera** | Alta. El servidor actúa como un cortafuegos que filtra peticiones corruptas antes de que impacten los límites.17 | Inexistente. Cualquiera puede duplicar las llamadas de red para agotar la cuota del plan gratuito en minutos.14 |
| **Cumplimiento de Seguridad (CSRF)** | Integrado. Next.js compara cabeceras de origen por defecto en Server Actions para impedir llamadas maliciosas.30 | Complejo. Requiere integraciones manuales complejas para evitar ataques de ejecución remota de terceros.30 |

En conclusión, el patrón arquitectónico expuesto en esta guía técnica no solo garantiza el pleno aprovechamiento del presupuesto gratuito de Netlify y Resend 1, sino que dota a la aplicación de un estándar de seguridad industrial, asimilable al de sistemas empresariales de gran escala, limitando estrictamente la exposición de datos y maximizando la confiabilidad del canal de distribución de correo.7

#### **Obras citadas**

1. Introducing Netlify's Free plan, fecha de acceso: junio 3, 2026, [https://www.netlify.com/blog/introducing-netlify-free-plan/](https://www.netlify.com/blog/introducing-netlify-free-plan/)  
2. Resend Pricing 2026: Every Plan, Every Tier Explained \- Nuntly, fecha de acceso: junio 3, 2026, [https://nuntly.com/resend-pricing](https://nuntly.com/resend-pricing)  
3. Zod v4 with Next.js 15: Complete Schema Validation for Forms, APIs, and Server Actions, fecha de acceso: junio 3, 2026, [https://noqta.tn/en/tutorials/zod-v4-nextjs-schema-validation-forms-apis-2026](https://noqta.tn/en/tutorials/zod-v4-nextjs-schema-validation-forms-apis-2026)  
4. Send emails with Next.js \- Resend, fecha de acceso: junio 3, 2026, [https://resend.com/nextjs](https://resend.com/nextjs)  
5. Environment variables in Next.js and Netlify, fecha de acceso: junio 3, 2026, [https://www.netlify.com/blog/2020/12/10/environment-variables-in-next.js-and-netlify/](https://www.netlify.com/blog/2020/12/10/environment-variables-in-next.js-and-netlify/)  
6. Honey Potting In Next JS. What is a Honey Pot? | by Zain Shahzad | Medium, fecha de acceso: junio 3, 2026, [https://medium.com/@zainshahza/honey-potting-in-next-js-acfd80eb8010](https://medium.com/@zainshahza/honey-potting-in-next-js-acfd80eb8010)  
7. Email Deliverability for SaaS: SPF, DKIM, DMARC Setup and Resend Integration, fecha de acceso: junio 3, 2026, [https://dev.to/whoffagents/email-deliverability-for-saas-spf-dkim-dmarc-setup-and-resend-integration-1hpd](https://dev.to/whoffagents/email-deliverability-for-saas-spf-dkim-dmarc-setup-and-resend-integration-1hpd)  
8. What is Resend Pricing, fecha de acceso: junio 3, 2026, [https://resend.com/docs/knowledge-base/what-is-resend-pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)  
9. Managing Domains \- Resend, fecha de acceso: junio 3, 2026, [https://resend.com/docs/dashboard/domains/introduction](https://resend.com/docs/dashboard/domains/introduction)  
10. Resend SPF, DKIM, DMARC Configuration \- Step-by-Step Guide | DmarcDkim.com, fecha de acceso: junio 3, 2026, [https://dmarcdkim.com/setup/how-to-setup-resend-spf-dkim-and-dmarc-records](https://dmarcdkim.com/setup/how-to-setup-resend-spf-dkim-and-dmarc-records)  
11. Implementing DMARC \- Resend, fecha de acceso: junio 3, 2026, [https://resend.com/docs/dashboard/domains/dmarc](https://resend.com/docs/dashboard/domains/dmarc)  
12. How to Verify a Domain in Resend \- YouTube, fecha de acceso: junio 3, 2026, [https://www.youtube.com/watch?v=CF6gRy-9\_LE](https://www.youtube.com/watch?v=CF6gRy-9_LE)  
13. Sending Emails with Attachments in Next.js Using ReSend and TypeScript \- Medium, fecha de acceso: junio 3, 2026, [https://medium.com/@leon.maxime/sending-emails-with-attachments-in-next-js-using-resend-and-typescript-1e6db055e24e](https://medium.com/@leon.maxime/sending-emails-with-attachments-in-next-js-using-resend-and-typescript-1e6db055e24e)  
14. Usage Limits \- Resend, fecha de acceso: junio 3, 2026, [https://resend.com/docs/api-reference/rate-limit](https://resend.com/docs/api-reference/rate-limit)  
15. What are Resend account quotas and limits?, fecha de acceso: junio 3, 2026, [https://resend.com/docs/knowledge-base/account-quotas-and-limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)  
16. How do I handle Zod validation errors with useActionState in Next.js 15? \#86447 \- GitHub, fecha de acceso: junio 3, 2026, [https://github.com/vercel/next.js/discussions/86447](https://github.com/vercel/next.js/discussions/86447)  
17. Next.js Server Actions Tutorial: Best Practices for Form Handling and Validation, fecha de acceso: junio 3, 2026, [https://eastondev.com/blog/en/posts/dev/20251219-nextjs-server-actions-forms/](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-server-actions-forms/)  
18. Use environment variables with frameworks | Netlify Docs, fecha de acceso: junio 3, 2026, [https://docs.netlify.com/build/frameworks/use-environment-variables-with-frameworks/](https://docs.netlify.com/build/frameworks/use-environment-variables-with-frameworks/)  
19. Next.js form validation on the client and server with Zod \- DEV Community, fecha de acceso: junio 3, 2026, [https://dev.to/bookercodes/nextjs-form-validation-on-the-client-and-server-with-zod-lbc](https://dev.to/bookercodes/nextjs-form-validation-on-the-client-and-server-with-zod-lbc)  
20. How to create forms with Server Actions \- Next.js, fecha de acceso: junio 3, 2026, [https://nextjs.org/docs/app/guides/forms](https://nextjs.org/docs/app/guides/forms)  
21. Prevent AI Bots from spamming your forms with honeypots | Nikolai Lehbrink, fecha de acceso: junio 3, 2026, [https://www.nikolailehbr.ink/blog/prevent-form-spamming-honeypot/](https://www.nikolailehbr.ink/blog/prevent-form-spamming-honeypot/)  
22. How to Use Shadow DOM and Honeypots to Deter Crawlers \- DEV Community, fecha de acceso: junio 3, 2026, [https://dev.to/brinobruno/how-to-use-shadow-dom-and-honeypots-to-deter-crawlers-5831](https://dev.to/brinobruno/how-to-use-shadow-dom-and-honeypots-to-deter-crawlers-5831)  
23. Send Email \- Resend, fecha de acceso: junio 3, 2026, [https://resend.com/docs/api-reference/emails/send-email](https://resend.com/docs/api-reference/emails/send-email)  
24. Environment variables overview | Netlify Docs, fecha de acceso: junio 3, 2026, [https://docs.netlify.com/build/environment-variables/overview/](https://docs.netlify.com/build/environment-variables/overview/)  
25. The Pitfalls of NEXT\_PUBLIC\_ Environment Variables \- DEV Community, fecha de acceso: junio 3, 2026, [https://dev.to/koyablue/the-pitfalls-of-nextpublic-environment-variables-96c](https://dev.to/koyablue/the-pitfalls-of-nextpublic-environment-variables-96c)  
26. Resend Pricing in 2026: Is it Worth It? \- UserJot, fecha de acceso: junio 3, 2026, [https://userjot.com/blog/resend-pricing-in-2025](https://userjot.com/blog/resend-pricing-in-2025)  
27. Credit-based pricing plans | Netlify Docs, fecha de acceso: junio 3, 2026, [https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)  
28. How many users to run out of bandwidth? What about DDoS attacks? \- Support, fecha de acceso: junio 3, 2026, [https://answers.netlify.com/t/how-many-users-to-run-out-of-bandwidth-what-about-ddos-attacks/149589](https://answers.netlify.com/t/how-many-users-to-run-out-of-bandwidth-what-about-ddos-attacks/149589)  
29. Build Minutes Pricing FAQ \- Netlify, fecha de acceso: junio 3, 2026, [https://www.netlify.com/pricing/faq/](https://www.netlify.com/pricing/faq/)  
30. next.config.js: serverActions, fecha de acceso: junio 3, 2026, [https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)