import type { Punto } from "../checklist-compra-coche/puntos";

// Pasos para vender un coche entre particulares, en el orden en que se hacen
export const GRUPOS_VENTA: { titulo: string; puntos: Punto[] }[] = [
  {
    titulo: "Antes de anunciarlo",
    puntos: [
      { id: "v-informe", texto: "Pide el informe de tu coche a la DGT", ayuda: "Comprueba que no tiene cargas, embargos ni reserva de dominio: si los tiene, el comprador no podrá ponerlo a su nombre." },
      { id: "v-itv", texto: "La ITV está en vigor", ayuda: "Con la ITV caducada se vende peor y el comprador no puede circular con él.", enlace: ["/itv", "Calcular cuándo le toca"] },
      { id: "v-ivtm", texto: "El impuesto de circulación del año está pagado" },
      { id: "v-multas", texto: "No tienes multas pendientes con el coche", ayuda: "Consúltalo en la sede de la DGT (TESTRA) y en tu ayuntamiento." },
      { id: "v-papeles", texto: "Tienes a mano el permiso de circulación, la ficha técnica, las llaves y el libro de mantenimiento" },
      { id: "v-precio", texto: "Has mirado el precio de coches como el tuyo", ayuda: "Compara anuncios del mismo modelo, año, motor y kilómetros. Un precio realista vende antes y atrae menos regateo.", enlace: ["/coches", "Ver precios orientativos en las fichas"] },
    ],
  },
  {
    titulo: "El anuncio",
    puntos: [
      { id: "v-fotos", texto: "Fotos con luz de día: delante, detrás, los dos laterales, interior, maletero y cuentakilómetros" },
      { id: "v-datos", texto: "Pones año, kilómetros, motor, cambio, etiqueta y fecha de la próxima ITV", enlace: ["/matricula", "Saber la etiqueta por matrícula"] },
      { id: "v-defectos", texto: "Cuentas los defectos que tiene", ayuda: "Lo que digas por escrito te protege después frente a reclamaciones por vicios ocultos." },
      { id: "v-matricula", texto: "Tapas la matrícula en las fotos", ayuda: "Evita que la copien para clonar el coche o para sacar sus datos." },
    ],
  },
  {
    titulo: "Para que no te estafen",
    puntos: [
      { id: "v-codigos", texto: "No das códigos que te lleguen por SMS ni aceptas «solicitudes de dinero» de Bizum", ayuda: "Un comprador real no necesita ningún código tuyo para pagarte. Si el Bizum te pide aceptar un pago, no es un ingreso: es un cargo." },
      { id: "v-cobro", texto: "No entregas el coche hasta ver el dinero en tu cuenta", ayuda: "Un justificante de transferencia o una captura se pueden falsificar. Con un cheque bancario, compruébalo llamando al banco con un teléfono que busques tú." },
      { id: "v-extranjero", texto: "Desconfías del comprador que no puede venir a verlo y te paga «con transportista»", ayuda: "Es la estafa más común: te piden adelantar el porte o te envían un pago falso por más dinero y te piden devolver la diferencia." },
      { id: "v-enlaces", texto: "No pinchas enlaces de «pago seguro» que te mande el comprador", ayuda: "Son páginas falsas que imitan a la plataforma para quedarse con los datos de tu tarjeta." },
      { id: "v-prueba", texto: "En la prueba vas tú dentro y has visto su DNI y su carné de conducir" },
      { id: "v-papeles-copia", texto: "No mandas fotos de tu DNI ni de los papeles del coche antes de cerrar la venta" },
    ],
  },
  {
    titulo: "El día de la venta",
    puntos: [
      { id: "v-contrato", texto: "Firmáis el contrato de compraventa por duplicado", ayuda: "Con los defectos conocidos, la fecha y la hora de entrega.", enlace: ["/contrato-compraventa-coche", "Rellenar el contrato"] },
      { id: "v-dni", texto: "Compruebas el DNI del comprador y guardas una copia del contrato firmado" },
      { id: "v-entrega", texto: "Entregas el permiso de circulación, la ficha técnica y todas las llaves" },
    ],
  },
  {
    titulo: "Después de vender",
    puntos: [
      { id: "v-notificacion", texto: "Comunicas la venta a la DGT (notificación de venta)", ayuda: "Se hace en la sede electrónica de la DGT o en una jefatura, con el contrato. Así dejas de responder del coche aunque el comprador tarde en ponerlo a su nombre." },
      { id: "v-transferencia", texto: "Compruebas que el comprador hace el cambio de titular", ayuda: "Tiene 30 días. Pide el informe del coche pasado ese plazo para confirmarlo.", enlace: ["/coste-transferencia", "Qué cuesta la transferencia"] },
      { id: "v-seguro", texto: "Avisas a tu aseguradora de la venta", ayuda: "Según tu póliza, pueden devolverte la parte del año que ya no vas a usar." },
      { id: "v-ivtm-despues", texto: "Sabes que el impuesto de circulación de este año ya no se devuelve", ayuda: "Lo paga quien era titular el 1 de enero. Si quieres repartirlo con el comprador, ponedlo en el contrato." },
      { id: "v-teletac", texto: "Quitas el telepeaje, la tarjeta de combustible y tus datos del navegador o la app del coche" },
    ],
  },
];

export const TOTAL_VENTA = GRUPOS_VENTA.reduce((n, g) => n + g.puntos.length, 0);
