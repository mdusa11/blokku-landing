// Enlace corto para los QR de los stickers: /play (y /p).
// Decide en el servidor por User-Agent: Android va directo a Google Play con
// el referrer (Play Console cuenta las instalaciones por utm_source=sticker);
// todo lo demás (iPhone, iPad, escritorio) a la landing, que avisa que por
// ahora Blokku es solo para Android. 302 y no 301: el destino se puede cambiar
// sin reimprimir los stickers. El resto del sitio lo sirven los assets.
const PLAY =
  'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku' +
  '&referrer=utm_source%3Dsticker%26utm_medium%3Dqr';
const WEB = 'https://blokku.online/?utm_source=sticker&utm_medium=qr';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/play' || pathname === '/play/' || pathname === '/p' || pathname === '/p/') {
      const ua = request.headers.get('user-agent') || '';
      const target = /android/i.test(ua) ? PLAY : WEB;
      return new Response(null, {
        status: 302,
        headers: { Location: target, 'Cache-Control': 'no-store', Vary: 'User-Agent' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
