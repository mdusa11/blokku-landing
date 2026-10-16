# Panel /admin

Página estática cifrada (AES-GCM + PBKDF2). Sin frameworks: `admin/app.html` (estructura) más `admin/panel/*.css` y `admin/panel/*.js`, que `scripts/build-admin.mjs` junta en orden de nombre, con `seed.js`, el catálogo y las imágenes, y cifra en `public/admin/index.html`:

```
ADMIN_KEY="<clave>" node scripts/build-admin.mjs
```

`ADMIN_PREVIEW=/ruta/fuera/del/repo.html` escribe además una copia SIN cifrar para probar. Solo esa copia acepta `?sb=http://127.0.0.1:PUERTO` para hablar con un Supabase local; la cifrada siempre usa el Supabase real.

Los códigos únicos se leen en el build desde `~/Desktop/Blokku/04-Seguridad-NO-COMPARTIR/codigos-canje.csv` (o `CODES_CSV=ruta`) y solo viajan dentro del contenido cifrado. En Supabase solo se guarda el estado y la nota de cada código, por su sha256, nunca el código. No metas códigos en `seed.js`: el repo es público.

## Dónde vive cada cosa

Todo en Supabase (`fngbputjfnwtrcwaabue`), por RPC con la clave del panel (`p_clave`). Los SQL están en el repo de Blokku (`supabase/`) y en el Escritorio (`Blokku/02-Documentos/Supabase`):

| Archivo | Funciones | Para qué |
|---|---|---|
| `1-canjes.sql` | `resumen_canjes` | Canjes de códigos fijos (stickers, únicos, maestros) |
| `2-remoto.sql` | `admin_codigos`, `admin_crear_codigos`, `admin_editar_codigo`, `admin_borrar_codigo`, `admin_eventos`, `admin_guardar_evento`, `admin_borrar_evento`, `admin_avisos`, `admin_guardar_aviso`, `admin_borrar_aviso`, `config_remota` | Códigos rotativos, eventos, avisos y drops |
| `3-panel.sql` | `admin_panel`, `admin_guardar_seccion`, `admin_historial`, `admin_version_seccion`, `admin_guardar_imagen`, `admin_imagenes`, `admin_borrar_imagen` | Datos propios del panel |

Si falta una función (404 / PGRST202), el panel muestra qué archivo correr. Sin `3-panel.sql` el panel queda en solo lectura.

### Secciones (`panel_secciones`)

Una fila por colección: `pendientes`, `versiones`, `timeline`, `premios`, `eventos_plan`, `cupones`, `decisiones`, `ideas` (cada una `{items, borrados, seedRev}`), `codigos_notas` (`{map: {sha256: {e, n}}}`) y `meta` (origen de los datos). Cada elemento lleva `_t` (última edición). Al guardar se manda la revisión que se tenía; si otra pestaña guardó antes, el panel mezcla elemento por elemento (gana el más reciente, los borrados se respetan) y reintenta. Cada sección conserva sus últimas 30 versiones (Ajustes › Historial). Las imágenes van en `panel_imagenes` (JPEG ≤ 1200 px, < 1 MB) y los elementos las citan como `img:<id>`.

El catálogo, logros, metas y rutas vienen de `catalogo.js`/`seed.js` y no se guardan: se leen del build. Cuando `seed.js` sube `seedRev`, los datos nuevos se suman a cada sección sin pisar lo editado (los campos en `_forzar` sí se reemplazan).

### Migración desde el panel anterior

El panel viejo guardaba en `localStorage['blokku_admin_doc']`. Si Supabase no tiene datos del panel (o solo tiene los de Claude sin decidir) y ese navegador tiene la copia vieja, el panel ofrece «Subir mis datos de este navegador a Supabase». La copia vieja no se borra, pero el panel ya no la lee (salvo desde Ajustes, a pedido). Ajustes también exporta e importa respaldos JSON.

## Worker

`worker.js` solo atiende `/play` y `/p` (QR de los stickers) y sirve `/admin` con `no-store` y `noindex`. Ya no hay API en Cloudflare.

## Diseñador de avisos

En En vivo › Avisos y drops (`55-disenador.js`). Cada aviso tiene `formato` (`tarjeta` | `ventana` | `imagen` | `banner`; `tipo` se deriva: tarjeta/banner → `tarjeta`, ventana/imagen → `drop`), hasta 2 `botones` (`{texto:{es,en}, accion, destino, estilo}`), `imagen_id` (imagen subida desde el panel como `pub_…`, WebP ≤ 1080 px y < 300 KB, que la app lee con `imagen_aviso`) y `acento` (`#RRGGBB`). `accion`/`destino` se siguen llenando con el primer botón compatible (url, tienda, evento, canjear) para las apps viejas. Destino de «Abrir Personalizar»: `temas|piezas|efectos|marcos|insignias` o el `cid` de un premio. Si Supabase no tiene las columnas o `imagen_aviso`, el panel avisa que hay que volver a correr `2-remoto.sql` y `3-panel.sql` y no deja guardar.
