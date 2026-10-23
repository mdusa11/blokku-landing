/* ================= ayuda en lenguaje llano: «¿Para qué sirve?» y «¿Cómo funciona?» por sección ================= */
var H_TARDA = '<b>Cuánto tarda:</b> los teléfonos lo reciben en unos minutos. La app pide los cambios al abrirse, al volver de segundo plano y cada cierto rato con la app abierta (como máximo unos 15 minutos).';
var H_OFFLINE = '<b>Sin internet:</b> la app usa lo último que recibió y el cambio le llega en cuanto vuelva a conectarse.';
var H_V15 = '<b>Qué versión lo soporta:</b> la app 1.0.5 o más nueva. Las versiones más viejas no lo ven (no pasa nada malo, simplemente no les sale).';
var H_HORA = '<b>Horas:</b> todas las fechas y horas de este panel son hora de México (Ciudad de México).';
var H_ESTADOS = '<b>Colores de estado:</b> <span class="estleg"><span>' + '<i class="chip ok" style="padding:2px 8px">Activo ahora</i> ya lo reciben los jugadores</span><span><i class="chip ac" style="padding:2px 8px">Programado</i> empieza más adelante</span><span><i class="chip line" style="padding:2px 8px">Vencido</i> ya terminó</span><span><i class="chip line" style="padding:2px 8px">Apagado</i> lo apagaste tú; no se muestra aunque esté en fechas</span></span>';
var H_SW = '<b>Interruptores:</b> verde «Encendido» = funciona o se muestra a los jugadores; gris «Apagado» = no.';

var AYUDA = {
  inicio: {
    que: 'Tu resumen del día: lo que necesita atención, los números importantes, tus pendientes y las próximas fechas.',
    ve: 'Nada. Esta pantalla es solo para ti; los jugadores no la ven.',
    cuando: 'Ábrela cada mañana. Si en «Atención» sale algo, tócalo y te lleva directo a resolverlo.',
    como: [
      'Cada cuadro de números es un atajo: tócalo para ir a su sección completa.',
      '<b>Atención</b> junta lo que pide tu mano: un código que se agotó o está por vencer, un evento por empezar o terminar, errores nuevos de la app y puntajes sospechosos del ranking. Si dice «Todo en orden», no hay nada urgente.',
      '<b>Ahora mismo en la app</b> es exactamente lo que ven los teléfonos en este momento (eventos y avisos). Si algo no aparece aquí, los jugadores tampoco lo ven.',
      'Los botones de arriba (Lanzar drop, Nuevo aviso, Crear códigos, Pendiente) son atajos a esas acciones.',
      '<b>Canjes</b> = veces que un jugador escribió un código y recibió su premio. Aquí cuentan los códigos fijos (stickers y únicos).',
      H_HORA, H_ESTADOS,
      '<b>Números:</b> llevan coma para separar miles (1,250 = mil doscientos cincuenta).'
    ]
  },
  metricas: {
    que: 'Cuánta gente abre y juega Blokku cada día, cuántos son nuevos, cuántos regresan y cuánto juegan.',
    ve: 'Nada. Es información anónima solo para ti: cada teléfono manda un resumen del día, sin nombre ni datos personales.',
    cuando: 'Úsala para saber si el juego crece (¿llegó gente nueva tras una publicación?) y si la gente vuelve a jugar (retención).',
    como: [
      'Funciona con la app 1.0.6 o más nueva. Quienes tengan una versión anterior no aparecen aquí (pero sí en Ranking si mandaron puntajes).',
      '<b>Activo</b>: abrió la app ese día, aunque no jugara. Cada teléfono cuenta una sola vez por día.',
      '<b>Nuevo</b>: la primera vez que se ve ese teléfono. Quien ya jugaba antes de la 1.0.6 no cuenta como nuevo; entra como «de antes».',
      '<b>Retención día 1 / 7 / 30</b>: de los que llegaron un día, qué porcentaje volvió a abrir la app 1, 7 o 30 días después. Ejemplo: 40 % en día 1 = 4 de cada 10 regresan al día siguiente. Un guion («…») significa que esos días todavía no pasan.',
      '<b>Partidas por jugador</b>: partidas terminadas por cada teléfono activo en un día. La mediana es el valor «de en medio» y es más fiel que el promedio cuando hay jugadores que juegan muchísimo.',
      '<b>Cuánto tarda:</b> la app manda su resumen al abrirse y al terminar partidas; con las gráficas, pulsa «Actualizar» para ver lo último. <b>Sin internet:</b> la app guarda el resumen y lo manda después.',
      'Quien apague «Enviar estadísticas anónimas» en Ajustes de la app no aparece, y por eso los números son un poco menores a la realidad.',
      'El país sale de la conexión (como en el ranking); la dirección IP no se guarda.'
    ]
  },
  'vivo/ahora': {
    que: 'Una vista de todo lo que los jugadores reciben ahora mismo sin actualizar la app: eventos, avisos y drops, y lo que viene en las próximas semanas.',
    ve: 'Lo que ves en los teléfonos dibujados abajo es lo que sale en el menú principal de Blokku y en las ventanas emergentes.',
    cuando: 'Úsala para confirmar que lo que acabas de crear ya está «en vivo», o para ver cómo se acomodan los eventos y avisos en el calendario.',
    como: [
      '<b>Drops en vivo</b>: códigos con pocos lugares que están saliendo en este momento. Puedes terminarlos antes de tiempo.',
      '<b>Plantillas</b>: avisos listos para usar (promo de otra app, actualización, cupón de temporada). Un toque abre el editor ya llenado.',
      '<b>Próximas semanas</b>: la línea de tiempo junta lo que ya está en la app (morado, rosa, azul) con lo que solo tienes planeado en el calendario (rayado, aún no llega a los teléfonos).',
      '<b>«Así lo ve la app ahora»</b> es la respuesta real del servidor. Si un aviso no aparece ahí, no le sale a nadie: revisa que esté encendido, que ya haya empezado y que no haya terminado.',
      H_V15, H_TARDA, H_OFFLINE, H_HORA
    ]
  },
  'vivo/avisos': {
    que: 'Mensajes que le aparecen al jugador dentro de Blokku sin que actualice la app: una tarjeta en el menú, una ventana emergente, una imagen grande o una franja delgada. Un «drop» es una ventana que regala un código con lugares limitados.',
    ve: 'Según el formato: una tarjeta debajo del botón Jugar, una ventana al abrir la app, una imagen de promo o un banner arriba del menú. Pueden llevar hasta 2 botones (abrir un link, ir a la tienda, canjear un código…).',
    cuando: 'Para avisar de un evento, regalar un código, pedir que actualicen la app, promocionar otra app tuya, o dar un mensaje a un jugador en particular.',
    como: [
      H_V15, H_TARDA, H_OFFLINE,
      '<b>Sin internet:</b> si el jugador abre la app sin conexión, ve el último aviso que recibió mientras siga vigente.',
      '<b>Ejemplo:</b> quieres regalar 20 piezas de una colección a las primeras 20 personas. «Lanzar drop» → eliges el premio, 20 lugares y 30 minutos. El panel crea el código y la ventana juntos; cuando se acaban los lugares el código deja de funcionar.',
      '<b>Frecuencia:</b> «Una vez» sale una sola vez por teléfono; «Una vez al día» vuelve a salir cada día mientras esté vigente; «Siempre» sale cada vez que abre la app.',
      '<b>Vistos y clics</b> los reporta la app. El porcentaje de clics es clics ÷ vistos: si 200 lo vieron y 30 tocaron el botón, son 15 %.',
      'Un aviso con <b>«Solo para jugador(es)»</b> lo reciben únicamente esos jugadores (necesitan la app 1.0.8 o más nueva y haber entrado al ranking).',
      H_SW, H_ESTADOS, H_HORA
    ]
  },
  'vivo/eventos': {
    que: 'Retos con fecha de inicio y fin que dan premios, por ejemplo «juega 5 partidas entre el 24 y el 31 de octubre y ganas un paquete».',
    ve: 'Una tarjeta del evento en el menú principal (con cuenta regresiva y su progreso) y, al completarlo, el premio. Desde 45 días antes se anuncia con «Empieza en N días».',
    cuando: 'Para fiestas y temporadas (Halloween, Navidad), o para mover las fechas de un evento que ya viene dentro de la app sin sacar versión nueva.',
    como: [
      H_V15, H_TARDA, H_OFFLINE,
      '<b>Sin internet:</b> el progreso del jugador se sigue contando con lo último que supo de las fechas.',
      'Los ids <b>muertos26</b> y <b>pionero</b> son eventos que ya vienen dentro de la app: si los editas aquí cambias sus fechas o premios sin versión nueva.',
      '<b>Apagar</b> deja de mostrarlo y de contar progreso (puedes volver a encenderlo). <b>Borrar</b> lo quita y la app lo apaga aunque ya lo tuviera guardado; se pierde el progreso de los jugadores.',
      '<b>Ejemplo:</b> «Navidad», meta «Jugar partidas», cantidad 5, del 15 al 26 de diciembre, premio: paquete Noche Nevada. En la app dirá «Juega 5 partidas».',
      H_SW, H_ESTADOS, H_HORA
    ]
  },
  'codigos/rotativos': {
    que: 'Códigos que tú creas aquí (por ejemplo para un sorteo o un giveaway) y que dan premios al canjearlos. Los controlas: cuántas personas lo pueden usar, hasta cuándo sirven y si están encendidos.',
    ve: 'El jugador va a Ajustes › Canjear código, escribe el código y recibe los premios. Si ya no sirve, la app le dice que está agotado, caducado o inválido.',
    cuando: 'Para sorteos, regalos a creadores, promos en redes o cualquier código que quieras poder apagar o limitar.',
    como: [
      H_V15 + ' Los códigos funcionan en cuanto los creas.',
      '<b>Cuánto tarda:</b> el código funciona al instante: se valida en el servidor cuando el jugador lo escribe. Necesita internet para canjearlo.',
      '<b>Sin internet:</b> el jugador no puede canjear un rotativo hasta que se conecte.',
      '<b>Usos</b> = cuántas veces en total se puede canjear el código (cada canje gasta un lugar). «Sin límite» sirve para un código público.',
      '<b>Caducidad</b> = después de esa fecha y hora (de México) la app responde «caducado».',
      '<b>Desactivar</b> lo apaga al momento; quien ya lo canjeó conserva su premio. Solo se pueden borrar los que nadie ha usado.',
      '<b>Ejemplo:</b> creas BLOKKU-OCT con 100 usos que caduca el 31 de octubre a las 23:59. Al canje 100 pasa a «Agotado»; si nadie llega a 100, pasa a «Caducado» el día 31.',
      'Formato automático: BK-XXXX-XXXX-XXXX, o el texto que tú elijas (4 a 20 letras o números).'
    ]
  },
  'codigos/unicos': {
    que: 'La lista de códigos de un solo uso que ya vienen escondidos dentro de la app (5 por premio, más los maestros). Aquí llevas el control de cuáles ya diste y a quién.',
    ve: 'El jugador escribe uno de estos códigos en Ajustes › Canjear código y desbloquea el premio. Cada código solo puede usarse una vez.',
    cuando: 'Cuando quieras regalar o publicar un premio concreto: toma un código «Disponible», dáselo a alguien y márcalo como «Regalado» para no repetirlo.',
    como: [
      'Funcionan con la app 1.0.4 o más nueva y <b>también sin internet</b>, porque el código vive dentro de la app.',
      'Los códigos NO se guardan en Supabase: solo existen dentro de este panel cifrado. En Supabase solo se guarda el estado que marcas y tu nota.',
      '<b>Disponible</b> = aún no lo das. <b>Publicado</b> = lo pusiste en redes o en público. <b>Regalado</b> = se lo diste a alguien en concreto (anota a quién en la nota).',
      'Marcar un estado o escribir una nota <b>no cambia nada para los jugadores</b>: es solo tu control. Para dejar de aceptar un código, usa «Revocados».',
      'Los <b>canjes</b> se cuentan desde la app 1.0.5 (de forma anónima).',
      'Los <b>códigos maestros</b> desbloquean casi todo: no los publiques ni los regales a la ligera.'
    ]
  },
  'codigos/stickers': {
    que: 'Los códigos que vienen impresos en los stickers de Blokku. Son permanentes y cualquiera puede usarlos las veces que quiera.',
    ve: 'Quien escriba el código del sticker en Ajustes › Canjear código recibe el premio de ese sticker.',
    cuando: 'Para llevar la cuenta de qué sticker da qué, cuántas veces se ha canjeado y dónde los repartiste.',
    como: [
      'Estos códigos viven dentro de la app (desde la 1.0.4) y no caducan; funcionan también sin internet.',
      'Los canjes se cuentan desde la 1.0.5.',
      'Editar o borrar un sticker aquí <b>solo cambia esta lista del panel</b>, no el código dentro de la app. Para que un sticker deje de funcionar, usa «Revocados» (app 1.0.6 o más nueva).',
      'Puedes subir fotos de cada sticker y anotar dónde los repartiste.'
    ]
  },
  'codigos/revocados': {
    que: 'La lista de códigos fijos (únicos, maestros o stickers) que ya no se deben aceptar, por ejemplo porque se filtraron en redes.',
    ve: 'Si escribe un código revocado, la app le dice que es inválido. Quien ya lo había canjeado conserva su premio.',
    cuando: 'Cuando un código se filtró, se dio por error o lo estás usando mal. Para los rotativos no se usa esta sección: se apagan en «Rotativos».',
    como: [
      'Funciona con la app 1.0.6 o más nueva. Las versiones anteriores no leen esta lista y seguirán aceptando el código.',
      H_TARDA + ' La app guarda la lista, así que también funciona sin internet (con la última lista que recibió).',
      'Escribes el código tal cual; el panel lo convierte a una «huella» que no se puede revertir y solo esa huella se guarda en Supabase, nunca el código.',
      'Quitar un código de la lista lo vuelve a aceptar en cuanto la app baje la lista nueva.',
      'Los códigos maestros anteriores a la 1.0.6 ya vienen revocados dentro de la app; no hace falta agregarlos.'
    ]
  },
  'codigos/canjes': {
    que: 'Cuántas veces se han canjeado los códigos: stickers, únicos, maestros y rotativos, por día, plataforma y premio.',
    ve: 'Nada. Es información solo para ti; no incluye nombres.',
    cuando: 'Para saber qué códigos funcionan mejor, si un sorteo tuvo respuesta o si un código se está usando más de lo normal (señal de que se filtró).',
    como: [
      'Los canjes de códigos fijos los reporta la app 1.0.5 o más nueva; los de rotativos los cuenta el servidor al canjearse.',
      'Es anónimo: solo se guarda qué código, qué plataforma, qué versión y qué día.',
      'Si falta un canje, puede ser que el jugador no tuviera internet en ese momento; la app lo manda cuando vuelve a conectarse.',
      'Pulsa «Actualizar» para traer los números más recientes.'
    ]
  },
  'juego/premios': {
    que: 'El catálogo de todo lo que un jugador puede ganar en Blokku: temas, estilos de pieza, marcos, efectos e insignias, con su rareza y todas las formas de conseguirlo.',
    ve: 'Estos premios aparecen en la pantalla Personalizar y en la vitrina del jugador cuando los desbloquea.',
    cuando: 'Para consultar qué premio existe, cómo se gana, dónde lo regalaste y para anotar ideas de premios futuros.',
    como: [
      'El catálogo viene del código de la app. El nombre, la rareza y las formas de ganarlo <b>no se cambian desde aquí</b> (se actualizan cuando Claude regenera los datos); lo que escribes aquí es solo tuyo.',
      'Lo tuyo se guarda aparte y no se pisa: el <b>plan</b>, las <b>notas</b> y las <b>imágenes</b>.',
      '<b>Plan</b> es solo una etiqueta para ti: «Solo código» = decidiste que se consiga únicamente con código; «Dormido» = existe pero no lo ofreces por ahora. <b>No cambia nada en la app.</b>',
      '«Premio futuro» sirve para apuntar ideas; tampoco llega a la app.',
      'Toca un premio para ver todas sus formas de ganarlo: ruta de nivel, logros, códigos únicos, rotativos, eventos y stickers.'
    ]
  },
  'juego/progresion': {
    que: 'Una guía de cómo avanza un jugador: los niveles del 1 al 100, los logros por escalones, las metas especiales y la racha del reto diario, con el premio de cada paso.',
    ve: 'El jugador va subiendo de nivel con XP (puntos de experiencia) y desbloquea premios en esos niveles, logros y rachas.',
    cuando: 'Para consultar «¿en qué nivel se gana tal premio?» o revisar si la dificultad está bien repartida.',
    como: [
      'Esta pantalla <b>solo muestra</b> cómo está hecho el juego; no se cambia desde aquí. Algunos valores (XP por partida, meta de misiones) se mueven en «Ajustes del juego».',
      'XP para llegar al nivel L: 125 × (L − 1)². Ejemplo: nivel 10 = 10,125 XP. Cada partida da 20 XP base más las líneas limpiadas (tope 3,000 por partida).',
      'Los logros tienen 5 escalones: Bronce, Plata, Oro, Diamante e Imposible (200, 500, 1,500, 5,000 y 15,000 XP).',
      'Toca cualquier premio para ver todas sus formas de ganarlo.'
    ]
  },
  'juego/temporadas': {
    que: 'Tu calendario de planes: versiones que vas a publicar, eventos, temporadas e hitos, junto con los eventos que ya están funcionando en la app.',
    ve: 'Solo lo que está en morado oscuro (eventos que ya existen en «Eventos») llega a los jugadores. Lo demás es tu plan privado.',
    cuando: 'Para planear con tiempo (Halloween, Navidad, estrenos) y no empalmar eventos.',
    como: [
      'Lo <b>morado oscuro</b> es un evento remoto: ya está en el servidor y la app lo usa.',
      'Todo lo demás es plan tuyo. <b>Escribirlo aquí no lo manda a la app.</b> Para que llegue a los teléfonos, créalo en En vivo › Eventos (hay un botón que lo hace con las mismas fechas).',
      'Las ideas se ven en gris.',
      H_HORA
    ]
  },
  'juego/ranking': {
    que: 'La lista de jugadores de Blokku con sus puntajes en cada modo. Aquí ves todo (incluso lo que los jugadores no ven) y limpias trampas.',
    ve: 'Cada jugador ve la tabla de su modo (Clásico, Contra reloj, Reto diario) con su lugar, y puede ver la tabla mundial o de su país. No ve los puntajes sospechosos ni a los jugadores ocultos.',
    cuando: 'Revisa los «Sospechosos» cada tanto: apruebas los legítimos y borras las trampas. Oculta o renombra a quien ponga un nombre ofensivo.',
    como: [
      'Cada instalación se registra sola con un nombre. Cuenta solo el mejor puntaje por modo y periodo (semana, histórico o día).',
      'Un puntaje <b>sospechoso</b> se acepta pero <b>no se ve para los jugadores</b> hasta que lo apruebes. Si es trampa, bórralo.',
      'Un jugador <b>oculto</b> desaparece de todas las tablas, sin borrar nada, y se puede volver a mostrar cuando quieras.',
      'Las <b>reglas anti-trampa</b> (abajo) deciden qué se rechaza y qué se marca como sospechoso. Valen para puntajes nuevos al instante; los ya guardados no cambian.',
      '<b>Cuánto tarda:</b> los cambios de moderación se aplican en cuanto los guardas; los jugadores ven la tabla actualizada la próxima vez que la abran. <b>Sin internet</b> la app no puede mandar ni ver el ranking.',
      'Las tablas muestran hasta 200 lugares. Usa el selector de fecha para ver semanas o días anteriores.',
      H_HORA
    ]
  },
  'juego/servidor': {
    que: 'Perillas del juego que puedes mover sin sacar una versión nueva: cuánto XP se gana, la duración del reto diario, apagar funciones en una emergencia, las frases de Blokki y los avisos de notificación.',
    ve: 'Cambios en cómo se siente el juego (más o menos XP, misiones más fáciles…), funciones que desaparecen si las apagas, y frases distintas de Blokki en el menú.',
    cuando: 'Para ajustar la dificultad o el ritmo, o para apagar rápido algo que falla (un poder con bug, las compras, el ranking) mientras sale la corrección.',
    como: [
      '<b>Qué versión lo soporta:</b> la app 1.0.8 o más nueva. Las versiones anteriores ignoran estos cambios.',
      H_TARDA,
      '<b>Sin internet:</b> la app usa los valores que recibió por última vez. Si algo viene raro o fuera de rango, usa el valor de fábrica (no se rompe).',
      'Cada tarjeta se guarda por separado. Un campo vacío = valor de fábrica.',
      'Los <b>porcentajes</b> son contra lo normal: 100 % = normal; 150 % = 50 % más; 50 % = la mitad.',
      'Los <b>interruptores</b> son para emergencias: verde «Encendida» = la función funciona; gris «Apagada» = desaparece o no se puede usar. Apagar no borra nada: al volver a encender todo sigue como estaba.',
      'Las <b>frases</b> solo cambian en español e inglés; los demás idiomas siguen con el texto de la app. Si dejas un idioma vacío, ese idioma usa el texto de la app.',
      'Para mandar un mensaje a un jugador concreto, usa Avisos › «Solo para jugador(es)».'
    ]
  },
  'juego/retos': {
    que: 'Los retos entre amigos: un jugador termina una partida de Clásico, la app le da un código corto y su amigo juega las mismas piezas para ver quién saca más. Aquí ves cuántos retos se crean y se aceptan, y controlas los límites.',
    ve: 'Al terminar una partida puede retar a un amigo con un enlace (blokku.online/r/CÓDIGO). Su amigo lo abre: si tiene Blokku, entra directo al reto; si no, ve una página con el puntaje a vencer y los botones de la tienda.',
    cuando: 'Revisa la conversión (cuántos retos se aceptan) para saber si la función funciona. Baja el límite diario o apaga los retos si ves abuso o algo que falla.',
    como: [
      '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Las versiones anteriores no tienen retos.',
      '<b>Retos activos</b> es un interruptor de emergencia: apagado = no se crean retos nuevos. Apagar no borra nada.',
      '<b>Retos por jugador al día</b> (1 a 200) limita cuántos puede crear cada jugador; por conexión el tope es 5 veces eso. <b>Días que dura un código</b> (1 a 365) solo cambia los retos nuevos.',
      '<b>Aceptado</b> = el reto tiene al menos un intento de un amigo. <b>Conversión</b> = aceptados entre creados.',
      '<b>Cuánto tarda:</b> la app guarda estos ajustes unas horas, así que un cambio puede tardar en llegar a todos.',
      'Para que el enlace abra la app directo (en vez de la página) hay que publicar los archivos de <i>.well-known</i> del sitio; mira admin/README.md.',
      H_HORA
    ]
  },
  'proyecto/pendientes': {
    que: 'Tu lista de cosas por hacer, de ti y de Claude, ordenadas en un tablero.',
    ve: 'Nada. Es solo para ti.',
    cuando: 'Cada vez que se te ocurra algo por hacer o quede algo esperando a una tienda o a otra persona.',
    como: [
      '<b>Para ahora</b>: se puede hacer hoy. <b>En espera</b>: depende de algo externo (escribe de qué en «En espera de…»). <b>Hecho</b>: ya quedó.',
      'Marca la casilla para pasarlo a Hecho. Toca un pendiente para editarlo, cambiar quién lo hace o borrarlo.',
      'Se guarda solo y lo ves igual desde tu teléfono o tu computadora. Si pierdes internet, se reintenta solo (arriba a la derecha dice «Guardado» cuando terminó).'
    ]
  },
  'proyecto/versiones': {
    que: 'El historial y el plan de versiones de la app: qué trae cada una, cómo va en Google Play y en el App Store y qué falta para publicarla.',
    ve: 'Nada directamente. Los jugadores ven la versión que publiques en la tienda.',
    cuando: 'Al preparar una publicación: lleva la checklist y marca el estado de Android y de iOS.',
    como: [
      'Cambia el estado de Android o iOS directo en la tarjeta: publicada, en revisión, lista, en desarrollo o idea.',
      'La checklist muestra el avance; toca un punto para marcarlo.',
      'Cambiar un estado aquí <b>no publica nada</b>: es solo tu control. Publicar se hace en Play Console o App Store Connect.',
      'Las capturas vienen de las fichas de las tiendas; también puedes subir las tuyas.'
    ]
  },
  'proyecto/ideas': {
    que: 'Una lista de ideas para el futuro (con votos para priorizar) y las decisiones que ya tomaste, para no volver a discutirlas.',
    ve: 'Nada. Es solo para ti.',
    cuando: 'Cuando se te ocurra una mejora, o cuando decidas algo importante («no vamos a poner anuncios en el ranking»).',
    como: [
      'Las flechas votan: más votos = sube en la lista. La prioridad (alta, media, baja) es solo una etiqueta.',
      'Cada decisión lleva fecha y el porqué, para acordarte después.',
      'Todo se guarda solo.'
    ]
  },
  'proyecto/errores': {
    que: 'Los fallos que la app reporta desde los teléfonos de los jugadores, agrupados por tipo: un renglón por error con cuántas veces pasó.',
    ve: 'Nada. El jugador no se entera; a lo sumo notó que algo falló.',
    cuando: 'Después de publicar una versión, o cuando alguien se queje de que algo no funciona.',
    como: [
      'Cada error se agrupa por su «firma»: si pasa 50 veces, ves un solo renglón con ×50.',
      'Los <b>nuevos</b> son los que no has abierto; al abrir uno queda como <b>visto</b>. Si marcas uno como <b>resuelto</b> y vuelve a pasar en una versión distinta, regresa a nuevo.',
      '«Copiar» arma un reporte listo para pegárselo a Claude y que lo arregle.',
      'Aquí solo llegan fallos de la lógica de la app. Los cierres totales (la app se cierra sola) se ven en Firebase Crashlytics (enlace al final de la página).',
      'Si un teléfono no tiene internet cuando falla, el reporte llega después, cuando se conecte.'
    ]
  },
  ajustes: {
    que: 'Dónde se guardan tus datos del panel, las versiones anteriores de cada sección y las copias de seguridad.',
    ve: 'Nada. Es solo para ti.',
    cuando: 'Si borraste algo por error (restaura una versión anterior), antes de un cambio grande (descarga un respaldo) o al usar un equipo ajeno (cierra sesión).',
    como: [
      'Cada sección guarda sus últimas 30 versiones. Restaurar una <b>no borra nada</b>: lo que había antes también queda en el historial.',
      'El respaldo es un archivo con todas tus secciones e imágenes. Importarlo reemplaza lo actual (lo actual queda en el historial).',
      'Los archivos «SQL» de Supabase son los que prenden cada función del panel. Si algo dice «Falta correr…», ahí se explica qué hacer.',
      'Los avisos, eventos, códigos y ajustes del juego se guardan directo en Supabase al presionar «Guardar»; no pasan por aquí.'
    ]
  }
};
