# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).
Los releases se publican empujando un tag de git `vX.Y.Z`, que dispara el
pipeline de CI/CD.

## [Sin publicar]

Primer desarrollo del constructor de plantillas de email. Aún no se ha publicado
ninguna versión; al cortar el primer release esta sección será sus notas.

### Añadido

- Constructor visual por bloques con arrastrar y soltar y reordenamiento en vivo,
  con 10 tipos de bloque: encabezado, texto, imagen, botón, tarjeta, divisor,
  espaciador, columnas, redes sociales y pie de página.
- Vista previa en vivo idéntica al email exportado, en escritorio y móvil.
- Exportación en varios formatos: HTML, texto plano, componente React (`.tsx`),
  Handlebars (`.hbs`), `.eml` y JSON.
- Personalización de tema: colores, tipografía con fuentes web embebidas,
  espaciado y bordes, además de modo oscuro de email.
- Variables / merge tags (`{{token}}`) con valores de muestra en la vista previa.
- Brand kits para guardar y reaplicar temas.
- Revisión previa (preflight) con puntuación y problemas localizados por bloque, y
  chequeo de contraste de accesibilidad (WCAG).
- Galería de plantillas de ejemplo por sector.
- Deshacer/rehacer y autoguardado.
- Internacionalización español/inglés con rutas por idioma (`/es`, `/en`).
- Persistencia local en el navegador (`localStorage`): la app funciona como sitio
  estático, sin base de datos.
- Envío de correo de prueba mediante una función serverless (Resend) con límite de
  tasa por IP.
- Tours guiados, notificaciones (toasts) y códigos de error localizados.
- Paquetes compartidos `@email/core` (modelo de dominio con Zod) y `@email/emails`
  (motor de render y generación de código React), consumidos por toda la app.

### Próxima versión

- Backend NestJS (persistencia en servidor, multiusuario y API documentada con
  Scalar) incluido en el repositorio pero aún no desplegado.

[Sin publicar]: https://github.com/CamiloMH/email-templates/compare/HEAD
