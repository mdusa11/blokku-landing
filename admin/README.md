# Panel /admin

Página estática cifrada (AES-GCM + PBKDF2). `scripts/build-admin.mjs` junta `app.html`, `seed.js` e imágenes y escribe `public/admin/index.html`:

```
ADMIN_KEY="<clave>" node scripts/build-admin.mjs
```

Los códigos de canje únicos se leen en el build desde `~/Desktop/Blokku/04-Seguridad-NO-COMPARTIR/codigos-canje.csv` (o `CODES_CSV=ruta`) y solo viajan dentro del contenido cifrado. El documento guarda estado y notas por sha256 del código, nunca el código. No metas códigos en `seed.js`: el repo es público.

## Guardado en la nube (Cloudflare KV)

Con el binding `ADMIN_KV` activo (ver `wrangler.toml`) el panel guarda en KV; sin él cae a localStorage y avisa «Guardado solo en este navegador». Sin binding la API responde 503 `{"error":"sin_kv"}`.

API (todas exigen `Authorization: Bearer <clave>`; el Worker compara `sha256(clave)` con el hash del repo; 10 intentos fallidos por IP cada 15 min y luego 429):

| Ruta | Qué hace |
|---|---|
| `GET /api/admin/doc` | `{rev, updated, doc}` (`doc: null` si aún no hay nada) |
| `PUT /api/admin/doc` | cuerpo `{baseVersion, doc}`; 409 con el documento actual si `baseVersion` no es el `rev` vigente; máx. 4 MB |
| `GET /api/admin/history` | últimas 20 versiones `{rev, updated, size}` |
| `POST /api/admin/restore` | cuerpo `{rev}`; la versión actual pasa al historial |
| `GET/PUT /api/admin/img/<id>` | imágenes agregadas por Manuel (data URI, máx. 600 KB), guardadas en `img:<id>` |

Leer el estado actual (por ejemplo, Claude):

```
curl -H "Authorization: Bearer $ADMIN_KEY" https://blokku.online/api/admin/doc
```
