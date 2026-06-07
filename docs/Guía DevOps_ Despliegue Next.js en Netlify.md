# **Guía de Ingeniería DevOps: Ciclo de Vida de Despliegue de Aplicaciones Next.js (SSG) en Netlify**

El despliegue de aplicaciones modernas basadas en Next.js con Generación de Sitios Estáticos (SSG) exige una estrategia de operaciones que garantice la alta disponibilidad, la protección de la cadena de suministro, la validación local rigurosa y un enrutamiento de red optimizado. En el ámbito corporativo, automatizar estas fases reduce la intervención manual y mitiga la introducción de vectores de ataque o fallos de configuración en producción.1 Esta guía técnica detalla la implementación de un ciclo de vida de despliegue automatizado, seguro y escalable en la plataforma Netlify utilizando herramientas nativas e integraciones de nivel empresarial.

## **1\. Automatización de Dependencias y Parcheo de Seguridad (Supply Chain Security)**

Las dependencias de código desactualizadas o vulnerables representan uno de los vectores de explotación más explotados en aplicaciones web modernas.1 La automatización del parcheo de seguridad mediante Dependabot y flujos de integración continua (CI) en GitHub Actions permite neutralizar vulnerabilidades conocidas (CVE) sin introducir regresiones ni sobrecargar al equipo de ingeniería con revisiones manuales repetitivas.1

### **Configuración Declarativa en Dependabot**

Para garantizar una cadencia de actualización controlada y predecible, se define el archivo de configuración .github/dependabot.yml en la raíz del repositorio.1 Este archivo segmenta los ecosistemas de dependencias (npm y GitHub Actions) y excluye las actualizaciones de versiones mayores (major), ya que estas últimas suelen incorporar cambios disruptivos (breaking changes) que requieren refactorización manual y pruebas de regresión exhaustivas.1

YAML  
version: 2  
updates:  
  \# Monitoreo de dependencias de la aplicación (npm)  
  \- package-ecosystem: "npm"  
    directory: "/"  
    schedule:  
      interval: "weekly"  
      day: "wednesday"  
      time: "09:00"  
      timezone: "Europe/Madrid"  
    open-pull-requests-limit: 10  
    ignore:  
      \- update-types: \["version-update:semver-major"\] \# Ignorar breaking changes automáticos   
    groups:  
      dependencies-group:  
        patterns:  
          \- "\*"

  \# Monitoreo de dependencias de flujos de trabajo (GitHub Actions)  
  \- package-ecosystem: "github-actions"  
    directory: "/"  
    schedule:  
      interval: "weekly"  
      day: "monday"  
      time: "09:00"  
      timezone: "Europe/Madrid"  
    open-pull-requests-limit: 5

Establecer un calendario desfasado (GitHub Actions los lunes y dependencias de aplicación los miércoles) evita la saturación de los canales de CI y facilita el aislamiento de errores de infraestructura frente a fallos lógicos de la aplicación.1

### **Flujo de Trabajo en GitHub Actions con Validación y Auto-Merge**

Cuando Dependabot detecta paquetes obsoletos, genera automáticamente una solicitud de extracción (Pull Request).1 Para consolidar de manera segura estos cambios en la rama principal, se debe implementar un flujo de trabajo en GitHub Actions que ejecute pruebas unitarias, análisis estáticos de seguridad y compilación de producción antes de autorizar la fusión.1  
El uso de herramientas externas de terceros para la fusión automática introduce riesgos de fuga de secretos y falta de control.5 Por ello, se recomienda utilizar el cliente de línea de comandos de GitHub (gh) integrado de forma nativa en los ejecutores virtuales de GitHub Actions.3  
El archivo .github/workflows/dependabot-ci.yml automatiza este proceso:

YAML  
name: Dependabot Automated Patching

on:  
  pull\_request:  
    types: \[opened, synchronize\]  
  schedule:  
    \- cron: '0 4 \* \* 3' \# Ejecución periódica complementaria: todos los miércoles a las 04:00 UTC

permissions:  
  contents: write  
  pull-requests: write

jobs:  
  validate-and-automerge:  
    runs-on: ubuntu-latest  
    \# Restringir la ejecución del auto-merge estrictamente al bot de Dependabot para evitar escalada de privilegios   
    if: github.actor \== 'dependabot\[bot\]'

    steps:  
      \- name: Checkout del Repositorio  
        uses: actions/checkout@v4

      \- name: Configurar Node.js  
        uses: actions/setup-node@v4  
        with:  
          node-version: '18.14.0' \# Versión mínima recomendada para la compatibilidad de Netlify CLI   
          cache: 'npm'

      \- name: Instalar Dependencias (Clean Install)  
        run: npm ci

      \- name: Auditoría de Seguridad de Dependencias  
        run: npm audit \--audit-level=high \[1\]

      \- name: Análisis Estático de Código (Linter)  
        run: npm run lint

      \- name: Ejecución de Pruebas Unitarias  
        run: npm run test

      \- name: Compilación Next.js (Static Site Generation)  
        run: npm run build \[1\]

      \- name: Extraer Metadatos de Dependabot  
        id: metadata  
        uses: dependabot/fetch-metadata@v2 \[1, 3\]  
        with:  
          github-token: ${{ secrets.GITHUB\_TOKEN }}

      \- name: Habilitar Auto-Merge para Minor y Patch en Dependabot  
        if: |  
          steps.metadata.outputs.update-type \== 'version-update:semver-minor' ||  
          steps.metadata.outputs.update-type \== 'version-update:semver-patch'  
        run: gh pr merge \--auto \--squash "$PR\_URL" \[3\]  
        env:  
          PR\_URL: ${{ github.event.pull\_request.html\_url }}  
          GITHUB\_TOKEN: ${{ secrets.GITHUB\_TOKEN }}

      \- name: Auto-Aprobación de Parches de Seguridad Críticos  
        if: steps.metadata.outputs.update-type \== 'version-update:semver-patch' \[3\]  
        run: gh pr review \--approve "$PR\_URL" \[3\]  
        env:  
          PR\_URL: ${{ github.event.pull\_request.html\_url }}  
          GITHUB\_TOKEN: ${{ secrets.GITHUB\_TOKEN }}

Este diseño del flujo de trabajo garantiza que las actualizaciones automáticas solo se apliquen si la aplicación Next.js compila correctamente (npm run build) y supera todas las pruebas de seguridad.1 El uso de la estrategia de fusión *squash* asegura un historial de Git limpio y comprensible, consolidando la actualización en un único commit dentro de la rama principal.1

## **2\. Validación Local de netlify.toml y Emulación del Entorno**

El archivo netlify.toml es el núcleo de la infraestructura como código (IaC) de una aplicación en Netlify, regulando desde los comandos de compilación hasta las reglas de redirección y las políticas de cabeceras HTTP.9 Introducir errores sintácticos o lógicos en este archivo puede interrumpir de inmediato el pipeline de despliegue o provocar comportamientos erróneos en el enrutamiento de borde.2

### **Instalación de Netlify CLI como Dependencia de Desarrollo**

Para evitar problemas derivados de discrepancias entre las versiones globales del CLI en los equipos de desarrollo y los ejecutores del pipeline, se debe vincular la herramienta netlify-cli directamente como una dependencia de desarrollo dentro del proyecto 8:

Bash  
npm install netlify-cli \--save-dev

### **Protocolo de Validación y Emulación Local**

La caja de herramientas del CLI de Netlify permite emular el comportamiento de producción localmente antes de realizar cualquier commit o push a la rama remota.8

| Comando de Validación | Propósito Técnico | Mecanismo de Acción |
| :---- | :---- | :---- |
| npx netlify build \--dry | Verificación Sintáctica y Estática 11 | Analiza la estructura del archivo netlify.toml, comprueba la validez gramatical de las directivas y simula la secuencia de ejecución de los plugins de compilación sin procesar código, ahorrando tiempo.11 |
| npx netlify build | Compilación de Producción Local 8 | Ejecuta el comando de compilación en el entorno local del mismo modo que se procesaría dentro de los contenedores de integración de Netlify.8 |
| npx netlify dev | Emulación de Red y Borde 10 | Levanta un servidor proxy local que inyecta variables de entorno, ejecuta funciones serverless y aplica cabeceras de seguridad y reglas de redirección en tiempo real.10 |
| npx netlify link | Sincronización de Contexto de Red 2 | Vincula el directorio local de trabajo con un identificador de sitio activo en Netlify, permitiendo la descarga de variables ambientales seguras configuradas en el panel de administración.2 |

### **Configuración del Bloque de Desarrollo para Next.js SSG**

Para asegurar que Next.js exporte los elementos estáticos de forma compatible con el motor de renderizado local y el entorno de Netlify, el archivo netlify.toml debe definir explícitamente el comando de desarrollo, la carpeta de exportación y la reescritura de APIs 9:

Ini, TOML  
\[build\]  
  command \= "next build"  
  publish \= "out" \# Carpeta de distribución donde Next.js genera los archivos SSG estáticos

\[dev\]  
  command \= "npm run dev"  
  port \= 3000  
  targetPort \= 3000  
  publish \= "out"  
  framework \= "\#custom" \# Evita la autodetección ambigua y fuerza la vinculación local del proxy   
  autoLaunch \= false

\[\[redirects\]\]  
  from \= "/api/\*"  
  to \= "/.netlify/functions/:splat"  
  status \= 200

Al utilizar npx netlify dev, el proxy de Netlify intercepta las llamadas en el puerto local y emula fielmente las cabeceras HTTP y redirecciones de producción, reduciendo el riesgo de fallos en el comportamiento de la aplicación tras el despliegue.10

## **3\. Configuración de Dominio Personalizado y Enrutamiento CDN**

La selección de la arquitectura DNS es determinante para el rendimiento de la aplicación, influyendo directamente en el tiempo hasta el primer byte (TTFB) y en la capacidad de distribuir el tráfico eficientemente en la red global de entrega de contenidos (CDN) de Netlify.14

### **Configuración con Proveedor DNS Externo (Manual)**

Si el equipo de operaciones opta por mantener el control del dominio en un registrador externo (como Cloudflare o AWS Route 53), se deben configurar manualmente los registros DNS para que apunten de forma segura a Netlify.15  
Para asociar un dominio personalizado se deben seguir estrictamente las siguientes directrices técnicas:

1. **Configuración del Subdominio (www.example.com)**: Cree un registro de alias canónico (CNAME) apuntando el subdominio principal directamente al host único asignado por Netlify 15:  
   * **Nombre**: www  
   * **Tipo**: CNAME  
   * **Valor**: mi-aplicacion.netlify.app 15  
2. **Configuración del Dominio Apex (example.com)**: Debido a las restricciones de la norma DNS (RFC 1034), no es posible asociar un CNAME directamente a la raíz de una zona (apex) sin anular otros registros indispensables como los MX.14 Se deben aplicar las siguientes opciones según el soporte del proveedor 15:  
   * **Opción Recomendada (Aplanamiento de CNAME / ALIAS / ANAME)**: Si el proveedor externo soporta aplanamiento de registros, apunte la raíz a la dirección lógica del equilibrador de carga de Netlify 15:  
     * **Nombre**: @ (o en blanco) 15  
     * **Tipo**: ALIAS / ANAME 15  
     * **Valor**: apex-loadbalancer.netlify.com 15  
   * **Opción de Reserva (Registro A Estático)**: Si el proveedor no dispone de tecnologías de aplanamiento, configure un registro A apuntando a la dirección IP estática pública del equilibrador de carga global de Netlify 15:  
     * **Nombre**: @ (o en blanco) 15  
     * **Tipo**: A 15  
     * **Valor**: 75.2.60.5 15

### **Comparativa de Arquitecturas: Netlify DNS vs. Proveedores Externos**

La delegación completa de la zona DNS a Netlify mediante la modificación de los servidores de nombres (NS) en el registrador ofrece ventajas significativas en términos de automatización frente a la gestión de registros manuales en un DNS externo.15

| Vector de Comparación | Gestión con DNS Externo (Manual) | Delegación de Zona (Netlify DNS) |
| :---- | :---- | :---- |
| **Optimización de Tráfico CDN** | El dominio apex resuelve a una única dirección IP lógica, lo que impide aplicar enrutamiento dinámico basado en geolocalización a nivel de DNS en el apex.14 | Tanto el dominio apex como los subdominios aprovechan el enrutamiento Anycast global de Netlify, dirigiendo al usuario al nodo físico más cercano.15 |
| **Aprovisionamiento SSL** | Requiere la validación manual e independiente de la propiedad de cada host agregado, lo que puede provocar bloqueos temporales por límites de frecuencia de Let's Encrypt.18 | Automatiza la emisión de certificados comodín (wildcard), cubriendo de manera instantánea todos los subdominios de forma transparente.18 |
| **Entornos de Staging Dinámicos** | Requiere la creación manual de un registro CNAME en el proveedor externo para cada rama que se desee exponer.15 | Genera automáticamente subdominios seguros para ramas Git (por ejemplo, staging.example.com), facilitando pruebas paralelas aisladas.15 |
| **Integridad de Vistas Previas** | Las previsualizaciones quedan limitadas a las direcciones por defecto de Netlify (deploy-preview-X.netlify.app).15 | Permite configurar subdominios personalizados para Deploy Previews (como preview-42.example.com), esenciales para integraciones de autenticación de terceros u OAuth que requieran dominios de confianza.15 |

La delegación de DNS mitiga el riesgo de errores de configuración humana, centraliza la administración de los recursos del sitio y optimiza la latencia global del tráfico entrante.15

## **4\. Gestión Avanzada de Certificados SSL y Enforzamiento de TLS**

La confidencialidad y la integridad de los datos en tránsito se garantizan mediante el uso obligatorio de conexiones cifradas basadas en el protocolo TLS (sucesor criptográfico de SSL).18

### **Mecanismos de Aprovisionamiento Let's Encrypt**

Cuando un dominio personalizado o subdominio se asocia a un sitio en Netlify, la plataforma inicia de forma automatizada un desafío ACME (generalmente del tipo HTTP-01) para validar el control del dominio y emitir un certificado gratuito de la entidad emisora Let's Encrypt.18  
Para que este aprovisionamiento ocurra de manera fluida, la propagación DNS global del dominio debe estar completada al 100%.18 Si el intento inicial de firma falla (comúnmente debido a demoras de propagación o registros obsoletos en caché), Netlify activa una política de reintentos automatizados con decremento de frecuencia 18:  
![][image1]  
Si transcurridos tres días no se ha completado la validación, el proceso se suspende, requiriendo que el administrador DNS resuelva los problemas de resolución y haga clic manualmente en "Renew Certificate" en el panel de Netlify.18

### **Forzado de HTTPS y Mitigación de Conflictos de Cabeceras**

Netlify implementa por defecto el forzado de tráfico bajo HTTPS de manera nativa para todos los sitios alojados; las peticiones entrantes sin cifrar sobre el puerto 80 son redirigidas de forma permanente (código de estado 301\) hacia el puerto cifrado 443\.20 No es posible desactivar este ajuste, lo que garantiza el cumplimiento de estándares mínimos de seguridad.20  
Para consolidar esta política y registrar la aplicación en la lista de precarga HSTS de los navegadores principales, se debe configurar una cabecera de transporte estricta (Strict-Transport-Security) con una duración mínima de dos años 18:  
![][image2]  
Un problema técnico recurrente al configurar esta directiva en netlify.toml es la duplicación de cabeceras en la respuesta HTTP.21 El servidor de origen de Netlify inyecta dinámicamente un HSTS predeterminado (Strict-Transport-Security: max-age=31536000).21 Si un desarrollador define la cabecera en minúsculas en el archivo de configuración, el proxy del servidor puede no reconocerla como una regla de reemplazo y emitir ambas cabeceras, lo que anula la política HSTS en navegadores estrictos que no toleran sintaxis duplicadas.21  
Para evitar este conflicto de duplicación, el archivo de configuración debe utilizar estrictamente la capitalización normalizada estándar de la cabecera en el bloque \[\[headers\]\] 21:

Ini, TOML  
\[\[headers\]\]  
  for \= "/\*"  
  \[headers.values\]  
    \# Se utiliza la capitalización exacta para forzar el reemplazo de la cabecera nativa   
    Strict-Transport-Security \= "max-age=63072000; includeSubDomains; preload"

### **Ciclo de Renovación Automática de Certificados**

Los certificados de seguridad firmados por Let's Encrypt tienen un ciclo de vida corto y estructurado 18:  
![][image3]  
Netlify se encarga de renovar los certificados de forma automatizada 30 días antes de su vencimiento, garantizando que el sitio permanezca protegido sin necesidad de intervención manual 18:  
![][image4]  
Si una renovación automática falla (debido a modificaciones DNS no planificadas o la presencia de registros CAA incompatibles), Netlify envía alertas tempranas por correo electrónico a los administradores.18 Esto proporciona un margen de seguridad de 30 días para diagnosticar y corregir el problema de red antes de que el certificado expire.18

### **Diagnóstico y Resolución de Errores Comunes de TLS/SSL**

Cuando el aprovisionamiento de seguridad se interrumpe, el equipo de ingeniería debe seguir un protocolo de resolución de problemas estructurado 18:

* **Persistencia de Múltiples Registros A**: La presencia de registros A adicionales en la raíz del dominio (apuntando a servidores antiguos o hostings inactivos) invalida los desafíos de Let's Encrypt.19 Se debe garantizar que la única IP activa sea la IP pública de Netlify (75.2.60.5).16  
* **Bloqueos por Políticas de CAA (Certificate Authority Authorization)**: Si la zona DNS incluye registros CAA, estos controlan estrictamente qué entidades pueden emitir certificados.18 Si el registro CAA autoriza únicamente a proveedores competidores (como DigiCert o Amazon Trust), Let's Encrypt rechazará la firma del certificado.18 La solución requiere eliminar los registros restrictivos o agregar una regla explícita que autorice a Let's Encrypt.18  
* **Uso de la Herramienta Let's Debug**: Cuando las validaciones fallan de forma no descriptiva, el equipo de operaciones debe analizar el host utilizando la utilidad Let's Debug para inspeccionar posibles problemas de conectividad de red, registros DNS mal formados o bloqueos a nivel de firewall.19

## **5\. Conclusiones y Recomendaciones de Operación**

Establecer un ciclo de vida de despliegue sólido para Next.js en Netlify requiere combinar la automatización de dependencias con estrictas validaciones previas y un enrutamiento de red optimizado. Se recomienda implementar las siguientes prácticas en el entorno de producción:

* **Centralizar la Gestión en Netlify DNS**: Delegar el control del dominio para aprovechar las ventajas de las renovaciones SSL automáticas y el enrutamiento de red de baja latencia.15  
* **Garantizar la Validación Local Obligatoria**: Integrar npx netlify build \--dry en los ganchos de pre-commit de Git o en los pipelines de validación para evitar que configuraciones erróneas en netlify.toml lleguen al repositorio.11  
* **Proteger la Cadena de Suministro**: Mantener las dependencias actualizadas mediante flujos automáticos de Dependabot y GitHub Actions, controlando los permisos de escritura del token y limitando la fusión automática a versiones menores y parches de seguridad.1  
* **Optimizar la Entrega de Contenido**: Configurar de manera estricta el forzado de HTTPS y la cabecera HSTS en el archivo netlify.toml utilizando la capitalización correcta, garantizando un rendimiento óptimo de la aplicación Next.js y el cumplimiento de las normativas de seguridad web actuales.18

#### **Obras citadas**

1. Automated Dependency Patching with Dependabot and GitHub ..., fecha de acceso: mayo 30, 2026, [https://tenbyte.de/blog/automated-dependency-patching-with-dependabot-and-github-actions](https://tenbyte.de/blog/automated-dependency-patching-with-dependabot-and-github-actions)  
2. Deploy in seconds with Netlify CLI, fecha de acceso: mayo 30, 2026, [https://www.netlify.com/blog/2019/05/28/deploy-in-seconds-with-netlify-cli/](https://www.netlify.com/blog/2019/05/28/deploy-in-seconds-with-netlify-cli/)  
3. How to Set Up Auto-Merge in GitHub Actions \- OneUptime, fecha de acceso: mayo 30, 2026, [https://oneuptime.com/blog/post/2025-12-20-github-actions-auto-merge/view](https://oneuptime.com/blog/post/2025-12-20-github-actions-auto-merge/view)  
4. Automating dependency updates with Dependabot, GitHub auto-merge, and GitHub Actions, fecha de acceso: mayo 30, 2026, [https://nicolasiensen.github.io/2022-07-23-automating-dependency-updates-with-dependabot-github-auto-merge-and-github-actions/](https://nicolasiensen.github.io/2022-07-23-automating-dependency-updates-with-dependabot-github-auto-merge-and-github-actions/)  
5. Enable Github Automerge · Actions · GitHub Marketplace, fecha de acceso: mayo 30, 2026, [https://github.com/marketplace/actions/enable-github-automerge](https://github.com/marketplace/actions/enable-github-automerge)  
6. Is there a way to automatically merge pull requests created by dependabot? · community · Discussion \#112234 \- GitHub, fecha de acceso: mayo 30, 2026, [https://github.com/orgs/community/discussions/112234](https://github.com/orgs/community/discussions/112234)  
7. Enable Pull Request Automerge · Actions · GitHub Marketplace, fecha de acceso: mayo 30, 2026, [https://github.com/marketplace/actions/enable-pull-request-automerge](https://github.com/marketplace/actions/enable-pull-request-automerge)  
8. Get started with Netlify CLI, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/)  
9. File-based configuration | Netlify Docs, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/build/configure-builds/file-based-configuration/](https://docs.netlify.com/build/configure-builds/file-based-configuration/)  
10. Local development with Netlify CLI, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/api-and-cli-guides/cli-guides/local-development/](https://docs.netlify.com/api-and-cli-guides/cli-guides/local-development/)  
11. build \- Netlify CLI command reference, fecha de acceso: mayo 30, 2026, [https://cli.netlify.com/commands/build/](https://cli.netlify.com/commands/build/)  
12. What's a Netlify Build Plugin Series: Part 2 \- Making Build Plugins, fecha de acceso: mayo 30, 2026, [https://www.netlify.com/blog/2020/05/20/whats-a-netlify-build-plugin-series-part-2-making-build-plugins/](https://www.netlify.com/blog/2020/05/20/whats-a-netlify-build-plugin-series-part-2-making-build-plugins/)  
13. Make the Netlify build wait for another GH Action to run \- Support, fecha de acceso: mayo 30, 2026, [https://answers.netlify.com/t/make-the-netlify-build-wait-for-another-gh-action-to-run/157647](https://answers.netlify.com/t/make-the-netlify-build-wait-for-another-gh-action-to-run/157647)  
14. How to Set Up Netlify DNS \- Custom Domains, CNAME, & Records, fecha de acceso: mayo 30, 2026, [https://www.netlify.com/blog/2020/03/26/how-to-set-up-netlify-dns-custom-domains-cname-and-a-records/](https://www.netlify.com/blog/2020/03/26/how-to-set-up-netlify-dns-custom-domains-cname-and-a-records/)  
15. Configure external DNS for a custom domain | Netlify Docs, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)  
16. Get started with domains | Netlify Docs, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/manage/domains/get-started-with-domains/](https://docs.netlify.com/manage/domains/get-started-with-domains/)  
17. Configure external DNS for a custom domain mixup \- Netlify Support Forums, fecha de acceso: mayo 30, 2026, [https://answers.netlify.com/t/configure-external-dns-for-a-custom-domain-mixup/78177](https://answers.netlify.com/t/configure-external-dns-for-a-custom-domain-mixup/78177)  
18. HTTPS (SSL) | Netlify Docs, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/)  
19. Troubleshoot SSL and HTTPS | Netlify Docs, fecha de acceso: mayo 30, 2026, [https://docs.netlify.com/manage/domains/troubleshooting/troubleshoot-ssl-and-https/](https://docs.netlify.com/manage/domains/troubleshooting/troubleshoot-ssl-and-https/)  
20. Disable forced HTTPS \- Netlify Support Forums, fecha de acceso: mayo 30, 2026, [https://answers.netlify.com/t/disable-forced-https/13431](https://answers.netlify.com/t/disable-forced-https/13431)  
21. Define strict-transport-security Header Cause Duplicate Headers \- Netlify Support Forums, fecha de acceso: mayo 30, 2026, [https://answers.netlify.com/t/define-strict-transport-security-header-cause-duplicate-headers/28179](https://answers.netlify.com/t/define-strict-transport-security-header-cause-duplicate-headers/28179)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA/CAYAAABdEJRVAAADeklEQVR4Xu3d0XHTQBQFUNdAC9RAC7RAC7RAC3RACZRAB3RABzRAAZA75E3evKziOM44jnLOjMbWaiXtKh++s7t2DgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXomPN9vXm+3zPHCiXCPb+3kAAOAt+HD4H6xWcuwcCVnPaaudAMAr9Pdm+z72f9++f3e7//Pu8NVLcEqbE1h+HO6PWKVvvw539U7x5bA+J2XzPqdaBbZcc3W/yN8kW/qZPs3AKLABwI4khHQzfCRIzDrXbLZ/Bp65/2fsPyQhaHV+AuC5ZmBLCNsKiNFDdsx6AhsA7MQMYln3ND/4ZzC4Zmn7bH/2K5RlxG0Goxx/7HqvVWB7LrNdZet+NQpaZj2BDQB2Yga2BJr5wf9p7F+zrcBWZXmdwWhV1iXMZeoxwXUGtpyXZ/atldUUZer18pJr5dic7txqw+xPmX2do3wCGwDsVAWJl1AB5Ng2g0m3Cpw92OR1BqOUba3Ry7Fcs2xdv5/f9+eI5ercMttV5jml1uD1/nUCGwDs1OqDf8tqGrFGj15S7j/XsFWb8jqD0Qxc3ezLHGGLef4ctez1875/OaDXne0q834l90x4rf7NICuwAcAOrUaPHnJqwLikWqxf047HAtssi1U4W5WtAlvKMh26Vb+2pwa29GsG5tTr6w0FNgDYoR5szvHUaySwPGY7dcq2B5kEq7muLMdX4WZOZ8ZWAJtTovk5lL5f+uharXMrpwS21YhgrtfLV30CAF65BIN86E89pCRwVPjpwaeO1++2lf7tzEuots4A1R3b72aYS59n/X6/Gl0r83mszi2nBLaE1vm7a3nWfdRNYAOAHZlrobZGoaJP4fVA0MPGKmBcMjzU/WdYKimrUbr0e04tdjWlGhVWe0DLaz23umbe5zmlfkJU9uv55H0924TYvu5sBrbV36Xr98w3eefxSz5zAOAK1E979FBxLLAlCFXAEx6Om4HtXJ45ALxB8z8C9EDQp1IrsPUAUiNBQsQ2gQ0AONtcMzVVQOhBIe/rvL4Qn/sENgCAK5fAtlqrdqpa8yawAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAlfsH3+oGigZE6ysAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,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>