# Asistencia Biométrica

Prototipo web del proyecto de grado *Desarrollo de un sistema biométrico web-IoT para el control de asistencia estudiantil en la UNINUÑEZ*.

Es una página estática (un solo archivo `index.html`, sin instalación ni servidor). Simula en el navegador el lector de huella AS608 + Arduino Mega, la toma de asistencia, el registro con consentimiento (Ley 1581 de 2012), los reportes de ausentismo y las curvas FAR/FRR. Los datos son de ejemplo.

## Cómo desplegarlo

**GitHub Pages**
1. Sube `index.html` y `README.md` a un repositorio.
2. Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. La página queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

**Netlify** (más rápido): entra a app.netlify.com/drop y arrastra esta carpeta.

**Hosting tradicional / cPanel**: copia `index.html` a `public_html`.

**Probar en local**: abre `index.html` con doble clic.

## Nota
Las fuentes se cargan desde Google Fonts. Sin internet la página funciona igual con las fuentes del sistema.
