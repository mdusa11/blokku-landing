# Panel /admin

Página estática cifrada (AES-GCM + PBKDF2). Sin frameworks: `admin/app.html` (estructura) más `admin/panel/*.css` y `admin/panel/*.js`, que `scripts/build-admin.mjs` junta en orden de nombre, con `seed.js`, el catálogo y las imágenes, y cifra en `public/admin/index.html`:

```
ADMIN_KEY="<clave>" node scripts/build-admin.mjs
```

`ADMIN_PREVIEW=/ruta/fuera/del/repo.html` escribe además una copia SIN cifrar para probar. Solo esa copia acepta `?sb=http://127.0.0.1:PUERTO` para hablar con un Supabase local; la cifrada siempre usa el Supabase real.

Los códigos únicos se leen en el build desde `~/Desktop/Blokku/04-Seguridad-NO-COMPARTIR/codigos-canje.csv` (o `CODES_CSV=ruta`) y solo viajan dentro del contenido cifrado. En Supabase solo se guarda el estado y la nota de cada código, por su sha256, nunca el código. No metas códigos en `seed.js`: el repo es público.

## Textos de ayuda

Los bloques «¿Para qué sirve?» y «¿Cómo funciona?» de cada sección viven en `admin/panel/15-ayuda.js` (objeto `AYUDA`, una entrada por ruta); `pageHead` los pinta solos. Los interruptores usan `tog()`: verde «Encendido» = funciona / se muestra, y el texto del estado sale solo (`on`/`off` lo cambian). Las fechas se muestran y se capturan en hora de México (UTC−6 fijo).

## Dónde vive cada cosa

Todo en Supabase (`fngbputjfnwtrcwaabue`), por RPC con la clave del panel (`p_clave`). Los SQL están en el repo de Blokku (`supabase/`) y en el Escritorio (`Blokku/02-Documentos/Supabase`):

| Archivo | Funciones | Para qué |
|---|---|---|
| `1-canjes.sql` | `resumen_canjes` | Canjes de códigos fijos (stickers, únicos, maestros) |
| `2-remoto.sql` | `admin_codigos`, `admin_crear_codigos`, `admin_editar_codigo`, `admin_borrar_codigo`, `admin_eventos`, `admin_guardar_evento`, `admin_borrar_evento`, `admin_avisos`, `admin_guardar_aviso`, `admin_borrar_aviso`, `config_remota` | Códigos rotativos, eventos, avisos y drops |
| `3-panel.sql` | `admin_panel`, `admin_guardar_seccion`, `admin_historial`, `admin_version_seccion`, `admin_guardar_imagen`, `admin_imagenes`, `admin_borrar_imagen` | Datos propios del panel |
| `4-ranking.sql` | `admin_ranking`, `admin_moderar`, `admin_ranking_resumen`, `admin_ranking_config` (y las del juego: `ranking_registrar`, `ranking_enviar`, `ranking_tabla`) | Ranking: jugadores, puntajes, moderación y reglas anti-trampa (Juego › Ranking). En el repo de Blokku es `supabase/ranking.sql` |
| `5-errores.sql` | `admin_errores`, `admin_error_estado` (y `reportar_error`, que llama la app) | Proyecto › Errores. En el repo de Blokku es `supabase/errores.sql` |
| `6-revocados.sql` | `admin_revocados`, `admin_revocar`, `admin_quitar_revocado` (y redefine `config_remota` con `codigos_revocados`) | Códigos › Revocados (app 1.0.6). Va después de `2-remoto.sql` y se vuelve a correr cada vez que se corra ese. En el repo de Blokku es `supabase/revocados.sql` |
| `7-metricas.sql` | `admin_metricas` (y `registrar_actividad`, que llama la app 1.0.6+) | Métricas (activos, nuevos, retención D1/D7/D30, partidas por jugador, repartos) y su tarjeta en Inicio. Va después de `2-remoto.sql`; solo hace falta el día que salga la 1.0.6. En el repo de Blokku es `supabase/metricas.sql` |
| `11-jugador-detalle.sql` | `admin_jugador` (y redefine `ranking_enviar` y `admin_ranking`) | Ficha del jugador en Juego › Ranking: plataforma, modelo, versión, partidas por modo, mejor puntaje por modo y días jugados. Va después de `4-ranking.sql`/`8-nombres.sql` y antes de `9-limites.sql`. Sin él, el cajón dice «Sin datos (versión anterior)» |
| `13-rank-envio.sql` | `admin_rank_envio` (y redefine `config_remota` con `rank_envio_*`) | Envíos al ranking a media partida (Juego › Ajustes del juego). Va después de `9-limites.sql` |
| `14-servidor.sql` | `admin_servidor`, `admin_buscar_jugadores`, `mis_avisos` (la llama la app), `_srv_*`; redefine `config_remota` (con TODO lo de 13 más `ajustes`, `apagado`, `textos`) y `admin_guardar_aviso` (columna `avisos.jugadores`) | Juego › **Ajustes del juego** (valores con rango, interruptores, frases de Blokki) y Avisos › «Solo para jugador(es)». Va después de `13`, siempre el último; se vuelve a correr cada vez que se corra `2`, `6`, `9`, `10` o `13`. Sin él, la sección dice qué correr y el aviso por jugador no se deja guardar (saldría para todos). App 1.0.8+ |
| `15-retos.sql` | `retos`, `reto_intentos`, `ajustes_app`; `retos_config`, `reto_crear`, `reto_ver`, `reto_jugar`, `reto_mios` (las llama la app) y `admin_retos` | Juego › **Retos** (estadísticas, interruptor, límite diario, días de caducidad, últimos 50 retos). Solo crea cosas nuevas y se puede volver a correr; va después de `4`, `9` y `14`. También lo usa el Worker (`/r/CODIGO`, vía `reto_ver`). App 2.0+ |
| `16-paises.sql` | `copa_paises`, `paises_publico`, `paises_mis_premios` (las llama la app) y `admin_paises`; tablas `copa_*`, `paises_*` | Juego › **Países** (Copa en vivo, campeones, regalo por país con interruptor, URLs de Instagram/TikTok, reglas de la Copa). Solo crea cosas nuevas (no redefine `config_remota`), así que no obliga a re-correr nada; va después de `14`. App 2.0+ |

Si falta una función (404 / PGRST202), el panel muestra qué archivo correr. Sin `3-panel.sql` el panel queda en solo lectura. Sin `4-ranking.sql` solo falla la sección Ranking (y su tarjeta en Inicio); sin `5-errores.sql`, solo Errores; sin `6-revocados.sql`, solo Revocados. Sin `7-metricas.sql`, Métricas dice qué correr (sin aviso global: antes de la 1.0.6 no hace falta).

### Revocados

Se revoca escribiendo el código en claro: el panel calcula en el navegador el mismo hash que la app (`62-revocados.js`: v2 = HMAC-SHA256 con `blokku-codes-v2|` para `BK-XXXX-XXXX-XXXX`; v1 = sha256 con `blokku-codes-v1|` para stickers) y a Supabase solo va el hash. La app compara contra los dos. `node scripts/test-revocados.mjs` revisa el hash contra los vectores de `test/revocados_test.dart` de Blokku.

Acceso: la pantalla de clave está fuera del cifrado (con el ícono público). «Recordar en este dispositivo» guarda la clave 30 días en `localStorage['bk_k_rem']` (`{k, exp}`); si no, solo en `sessionStorage['bk_k']`. «Cerrar sesión en este dispositivo» borra ambas y los cachés del panel.

### Secciones (`panel_secciones`)

Una fila por colección: `pendientes`, `versiones`, `timeline`, `premios`, `eventos_plan`, `cupones`, `decisiones`, `ideas` (cada una `{items, borrados, seedRev}`), `codigos_notas` (`{map: {sha256: {e, n}}}`) y `meta` (origen de los datos). Cada elemento lleva `_t` (última edición). Al guardar se manda la revisión que se tenía; si otra pestaña guardó antes, el panel mezcla elemento por elemento (gana el más reciente, los borrados se respetan) y reintenta. Cada sección conserva sus últimas 30 versiones (Ajustes › Historial). Las imágenes van en `panel_imagenes` (JPEG ≤ 1200 px, < 1 MB) y los elementos las citan como `img:<id>`.

El catálogo, logros, metas y rutas vienen de `catalogo.js`/`seed.js` y no se guardan: se leen del build. Cuando `seed.js` sube `seedRev`, los datos nuevos se suman a cada sección sin pisar lo editado (los campos en `_forzar` sí se reemplazan).

### Migración desde el panel anterior

El panel viejo guardaba en `localStorage['blokku_admin_doc']`. Si Supabase no tiene datos del panel (o solo tiene los de Claude sin decidir) y ese navegador tiene la copia vieja, el panel ofrece «Subir mis datos de este navegador a Supabase». La copia vieja no se borra, pero el panel ya no la lee (salvo desde Ajustes, a pedido). Ajustes también exporta e importa respaldos JSON.

## Worker

`worker.js` solo atiende `/play` y `/p` (QR de los stickers), `/r/CODIGO` (página del reto de un amigo) y sirve `/admin` con `no-store` y `noindex`. Ya no hay API en Cloudflare.

`/r/CODIGO` (6 caracteres de `23456789ABCDEFGHJKMNPQRSTUVWXYZ`; otro formato redirige a `/`) llama a `reto_ver` de Supabase (timeout 3.5 s, caché de 60 s por código) y muestra el puntaje a vencer con botones a Google Play (con referrer `utm_campaign=CODIGO`) o App Store según el dispositivo. Todo dato del servidor se escapa. Si la app está instalada, la abren los App Links / Universal Links antes de llegar aquí; eso depende de `public/.well-known/`:

- `assetlinks.json` (Android): lleva el SHA-256 del **certificado de firma de la app de Play App Signing** (Play Console › Configuración › Integridad de la app › Firma de apps). Mientras diga `PEGAR_AQUI_SHA256_DE_PLAY_APP_SIGNING` los enlaces NO abren la app. El SHA-256 de la clave de subida (`~/blokku-upload.jks`) solo sirve para pruebas con un build firmado localmente.
- `apple-app-site-association` (iOS, sin extensión): `9JCD8GGN73.com.dusasolutions.blokku`, ruta `/r/*`. Se sirve como `application/json` por `public/_headers`. Además, la app iOS necesita el entitlement Associated Domains `applinks:blokku.online`.

Prueba del Worker sin red: `node scripts/test-reto-worker.mjs`.

## Diseñador de avisos

En En vivo › Avisos y drops (`55-disenador.js`). Cada aviso tiene `formato` (`tarjeta` | `ventana` | `imagen` | `banner`; `tipo` se deriva: tarjeta/banner → `tarjeta`, ventana/imagen → `drop`), hasta 2 `botones` (`{texto:{es,en}, accion, destino, estilo}`), `imagen_id` (imagen subida desde el panel como `pub_…`, WebP ≤ 1080 px y < 300 KB, que la app lee con `imagen_aviso`) y `acento` (`#RRGGBB`). `accion`/`destino` se siguen llenando con el primer botón compatible (url, tienda, evento, canjear) para las apps viejas. Destino de «Abrir Personalizar»: `temas|piezas|efectos|marcos|insignias` o el `cid` de un premio. Si Supabase no tiene las columnas o `imagen_aviso`, el panel avisa que hay que volver a correr `2-remoto.sql` y `3-panel.sql` y no deja guardar.
