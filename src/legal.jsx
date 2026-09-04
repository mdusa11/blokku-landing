import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, ShoppingCart, Gamepad2, Bug } from 'lucide-react'
import { AppIcon, Logo } from './bits.jsx'

export const SUPPORT_EMAIL = 'mdusa1104@gmail.com'
const UPDATED = '4 de septiembre de 2026'

function LegalLayout({ title, children }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="wrap legal">
        <a href="#/" className="legal-back">← Volver a BLOKKU</a>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
            <AppIcon size={54} />
            <Logo size={34} />
          </div>
          <h1 className="display legal-title">{title}</h1>
          <p className="legal-updated">Última actualización: {UPDATED}</p>
          <div className="legal-body">{children}</div>
        </motion.div>
        <footer style={{ padding: '40px 0 20px' }}>
          <a href="#/" className="legal-back">← Volver a BLOKKU</a>
        </footer>
      </div>
    </div>
  )
}

/* ═══ TÉRMINOS Y CONDICIONES ══════════════════════════════════════════════════ */
export function Terminos() {
  return (
    <LegalLayout title="TÉRMINOS Y CONDICIONES">
      <h3>1. Aceptación</h3>
      <p>
        Al descargar, instalar o usar <strong>Blokku</strong> (la "App"), operada por <strong>DUSA Solutions</strong>
        ("nosotros"), aceptas estos Términos y Condiciones. Si no estás de acuerdo, no uses la App.
      </p>

      <h3>2. Licencia de uso</h3>
      <p>
        Te otorgamos una licencia personal, limitada, no exclusiva e intransferible para usar la App con fines de
        entretenimiento. No puedes copiar, modificar, distribuir, vender, hacer ingeniería inversa ni explotar
        comercialmente la App o cualquiera de sus partes.
      </p>

      <h3>3. Compras dentro de la App</h3>
      <p>
        La App es gratuita y completa: todos los modos, poderes y desbloqueables están disponibles sin pagar.
        Existe <strong>una sola compra opcional</strong>, procesada por Google Play:
      </p>
      <ul>
        <li><strong>Sin Anuncios</strong> — pago único que elimina la publicidad para siempre.</li>
      </ul>
      <p>
        No hay suscripciones, monedas virtuales ni consumibles de ningún tipo. El precio se muestra antes de
        confirmar la compra, y los reembolsos se rigen por la política de Google Play y la ley aplicable.
      </p>

      <h3>4. Progreso y datos de juego</h3>
      <p>
        El progreso se guarda localmente en tu dispositivo. Desinstalar la App o borrar sus datos puede eliminar tu
        progreso de forma permanente. La compra "Sin Anuncios" se puede recuperar con
        <em>"Restaurar compras"</em> en la pantalla Sin Ads de la App.
      </p>

      <h3>5. Conducta</h3>
      <p>
        No está permitido usar trampas, exploits, herramientas de automatización o modificaciones de la App, ni
        interferir con su funcionamiento. Podemos suspender el acceso a funciones en caso de abuso o fraude.
      </p>

      <h3>6. Propiedad intelectual</h3>
      <p>
        Blokku, su nombre, logotipos, diseño, arte, música y código son propiedad de DUSA Solutions y están
        protegidos por las leyes de propiedad intelectual. Todos los derechos reservados.
      </p>

      <h3>7. Anuncios</h3>
      <p>
        La versión gratuita muestra anuncios de terceros (Google AdMob). Los anuncios recompensados son siempre
        opcionales. Puedes eliminar los anuncios con la compra única "Sin Anuncios".
      </p>

      <h3>8. Limitación de responsabilidad</h3>
      <p>
        La App se ofrece "tal cual", sin garantías de ningún tipo. En la máxima medida permitida por la ley, DUSA
        Solutions no será responsable por daños indirectos, pérdida de datos o de progreso, ni por interrupciones
        del servicio.
      </p>

      <h3>10. Cambios</h3>
      <p>
        Podemos actualizar estos términos y la App en cualquier momento. Los cambios relevantes se comunicarán
        dentro de la App o en esta página. El uso continuado tras un cambio implica su aceptación.
      </p>

      <h3>11. Ley aplicable y contacto</h3>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier duda:
        {' '}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalLayout>
  )
}

/* ═══ AVISO DE PRIVACIDAD ═════════════════════════════════════════════════════ */
export function Privacidad() {
  return (
    <LegalLayout title="AVISO DE PRIVACIDAD">
      <p>
        <strong>DUSA Solutions</strong> ("nosotros") es responsable del tratamiento de los datos personales
        recabados a través de la app <strong>Blokku</strong>, conforme a la Ley Federal de Protección de Datos
        Personales en Posesión de los Particulares (México) y, cuando aplique, el RGPD.
      </p>

      <h3>1. Datos que recopilamos</h3>
      <ul>
        <li><strong>Identificadores de dispositivo y publicidad</strong> (ej. Advertising ID) — usados por nuestros proveedores de anuncios y para prevenir fraude.</li>
        <li><strong>Datos de compras</strong> — Google Play y RevenueCat procesan tus compras; recibimos confirmaciones de transacción (no vemos ni almacenamos datos de tarjetas).</li>
        <li><strong>Datos técnicos y de uso</strong> — modelo de dispositivo, versión del sistema, métricas de rendimiento y eventos de juego agregados.</li>
        <li><strong>Progreso de juego</strong> — se guarda localmente en tu dispositivo; no lo subimos a servidores propios.</li>
      </ul>
      <p>No recopilamos tu nombre, dirección, contactos ni ubicación precisa.</p>

      <h3>2. Finalidades</h3>
      <ul>
        <li>Operar el juego y entregar tus compras.</li>
        <li>Mostrar anuncios (versión gratuita) y medir su rendimiento.</li>
        <li>Prevenir fraude y abuso.</li>
        <li>Mejorar la App con métricas agregadas.</li>
      </ul>

      <h3>3. Terceros que tratan datos</h3>
      <ul>
        <li><strong>Google AdMob</strong> (anuncios) — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a></li>
        <li><strong>Google Play Billing / Play Games Services</strong> — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a></li>
        <li><strong>RevenueCat</strong> (gestión de compras y suscripciones) — <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a></li>
      </ul>

      <h3>4. Consentimiento de anuncios</h3>
      <p>
        Donde la ley lo exige (p. ej. Espacio Económico Europeo), la App muestra un mensaje de consentimiento para
        anuncios personalizados. Puedes cambiar tu elección en Ajustes de la App, o limitar la personalización desde
        los ajustes de publicidad de tu dispositivo (restablecer/eliminar Advertising ID).
      </p>

      <h3>5. Menores</h3>
      <p>
        Blokku es apto para todas las edades y no está dirigida a recopilar información personal de menores. No
        recopilamos conscientemente datos personales de menores de 13 años.
      </p>

      <h3>6. Conservación y seguridad</h3>
      <p>
        Conservamos los datos de transacciones el tiempo requerido por obligaciones legales y de facturación. Los
        datos técnicos se conservan en forma agregada. Aplicamos medidas de seguridad administrativas y técnicas
        razonables para protegerlos.
      </p>

      <h3>7. Tus derechos (ARCO)</h3>
      <p>
        Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición, así como revocar tu
        consentimiento, escribiendo a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Responderemos en los
        plazos que marca la ley.
      </p>

      <h3>8. Cambios a este aviso</h3>
      <p>
        Cualquier cambio se publicará en esta página con su fecha de actualización. Te recomendamos revisarla
        periódicamente.
      </p>
    </LegalLayout>
  )
}

/* ═══ ELIMINACIÓN DE DATOS ════════════════════════════════════════════════════ */
// Google Play exige una ruta para solicitar el borrado de datos que funcione
// SIN tener la app instalada. De ahí que esta página exista y se enlace desde
// la ficha de la tienda.
export function EliminarDatos() {
  return (
    <LegalLayout title="ELIMINAR MIS DATOS">
      <p>
        Blokku <strong>no tiene cuentas de usuario</strong>: no hay registro, correo ni contraseña. Tu progreso
        (puntuación, récord, nivel, logros y cosméticos) se guarda <strong>solo en tu dispositivo</strong>.
      </p>

      <h3><Gamepad2 size={18} /> Borrar desde la app</h3>
      <p>Es inmediato y no requiere pedirnos nada:</p>
      <ol>
        <li>Abre Blokku y entra a <strong>Ajustes</strong> (el engrane del menú).</li>
        <li>Baja hasta <strong>Datos y privacidad</strong>.</li>
        <li>Toca <strong>Eliminar mis datos</strong> y confirma.</li>
      </ol>
      <p>
        Eso borra de forma permanente todo tu progreso local y el estado de la compra en ese dispositivo.
        <strong> No se puede deshacer.</strong>
      </p>

      <h3><Mail size={18} /> Solicitarlo por correo</h3>
      <p>
        Si ya desinstalaste la app o quieres que borremos los datos que están fuera de tu dispositivo, escríbenos a{' '}
        <a href={`mailto:${SUPPORT_EMAIL}?subject=Eliminar%20mis%20datos%20-%20Blokku`}>{SUPPORT_EMAIL}</a> desde el
        correo asociado a tus compras. Respondemos en un plazo máximo de <strong>30 días</strong>.
      </p>

      <h3><ShoppingCart size={18} /> Qué pasa con tu compra</h3>
      <ul>
        <li>
          <strong>Sin Anuncios</strong> es un pago único ligado a tu cuenta de Google Play. Borrar tus datos
          <strong> no la reembolsa</strong>, y puedes recuperarla con <em>"Restaurar compras"</em> si reinstalas.
        </li>
        <li>
          Los reembolsos los gestiona{' '}
          <a href="https://support.google.com/googleplay/answer/2479637" target="_blank" rel="noopener noreferrer">Google Play</a>,
          no nosotros.
        </li>
        <li>
          El identificador anónimo que RevenueCat asocia a tu compra se elimina si lo pides por correo.
        </li>
      </ul>

      <h3><Bug size={18} /> Datos que gestionan terceros</h3>
      <ul>
        <li>
          <strong>Google Play Games:</strong> si iniciaste sesión, tu perfil y partidas en la nube los administra Google
          desde tu{' '}
          <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer">Cuenta de Google</a>.
        </li>
        <li>
          <strong>Identificador de publicidad:</strong> puedes restablecerlo o borrarlo en los ajustes de Android,
          en Privacidad → Anuncios.
        </li>
        <li>
          Google Play conserva los registros mínimos de transacción que le exige la ley fiscal, aunque borres el resto.
        </li>
      </ul>
    </LegalLayout>
  )
}

/* ═══ SOPORTE ═════════════════════════════════════════════════════════════════ */
export function Soporte() {
  return (
    <LegalLayout title="SOPORTE">
      <p>¿Algo no funciona o tienes una idea para mejorar Blokku? Estamos para ayudarte.</p>

      <h3><Mail size={18} /> Contacto</h3>
      <p>
        Escríbenos a <a href={`mailto:${SUPPORT_EMAIL}?subject=Soporte%20Blokku`}>{SUPPORT_EMAIL}</a> y te
        respondemos normalmente en <strong>24–48 horas hábiles</strong>. Para ayudarte más rápido incluye:
      </p>
      <ul>
        <li>Modelo de tu teléfono y versión de Android.</li>
        <li>Qué pasó y qué esperabas que pasara.</li>
        <li>Una captura o video si es posible.</li>
      </ul>

      <h3><ShoppingCart size={18} /> Problemas con compras</h3>
      <ul>
        <li><strong>No llegó mi compra:</strong> abre <em>Sin Ads</em> en el menú y toca <em>"Restaurar compras"</em>. Si no aparece, espera unos minutos y reinicia la App.</li>
        <li><strong>Reembolsos:</strong> se gestionan a través de <a href="https://support.google.com/googleplay/answer/2479637" target="_blank" rel="noopener noreferrer">Google Play</a>.</li>
      </ul>

      <h3><Gamepad2 size={18} /> Preguntas frecuentes</h3>
      <ul>
        <li><strong>¿Perdí mi progreso al cambiar de teléfono?</strong> El progreso se guarda en tu dispositivo. Las compras duraderas (Sin Anuncios, Pase) sí se pueden restaurar en el nuevo equipo con tu cuenta de Google.</li>
        <li><strong>¿El juego necesita internet?</strong> No — solo para anuncios, compras y el ranking de amigos.</li>
        <li><strong>¿Cómo activo el modo para daltonismo?</strong> Ajustes (engrane en el menú) → <em>Símbolos en las gemas</em>.</li>
      </ul>

      <h3><Bug size={18} /> Reportar un bug</h3>
      <p>
        Mándanos el reporte por correo con el asunto <em>"Bug"</em>. Los bugs confirmados suelen corregirse en la
        siguiente actualización.
      </p>
    </LegalLayout>
  )
}
