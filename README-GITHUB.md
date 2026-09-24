# StatsBasket 1.2 (GitHub Pages)

El portal estático y su calendario (55 partidos, 5 actas) se despliegan en statsbasket.com. Se mantienen **todos** los archivos originales del repositorio en `public/` y el antiguo `index.html` recuperable en `legacy/previous-index.html`. Se conserva el fragmento UA-88735130-1 de Google Analytics por continuidad, pero Universal Analytics está discontinuado: para volver a medir visitas hay que configurar una propiedad GA4. Las 7 temporadas normalizadas están en `data/archives/`, además de sus fuentes históricas `public/partidos*.json`. El código PHP de administración y Live está en `server-php/` sin contraseñas, no desplegado en Pages.

## Identidad de jugadores
Dentro de una misma temporada, StatsBasket considera que **equipo + dorsal** identifica al jugador. Si una primera acta llega sin nombre (por ejemplo, `NOMBRE` o `Jugador #3 (sin identificar)`) y una acta posterior o una edición administrativa aporta el nombre real para ese mismo equipo y dorsal, ese nombre pasa a ser el nombre canónico y se aplica también a todas las estadísticas anteriores asociadas a ese dorsal.
