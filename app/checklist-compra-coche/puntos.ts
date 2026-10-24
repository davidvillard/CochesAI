// Puntos de la checklist de compra (los usa la página y el componente)

export type Punto = { id: string; texto: string; ayuda?: string; enlace?: [string, string] };

export const GRUPOS: { titulo: string; puntos: Punto[] }[] = [
  {
    titulo: "Documentación",
    puntos: [
      { id: "doc-titular", texto: "El permiso de circulación y la ficha técnica están a nombre del vendedor", ayuda: "Si no es el titular, pide una autorización firmada." },
      { id: "doc-bastidor", texto: "El número de bastidor del coche coincide con el de los papeles", ayuda: "Está en el chasis, bajo el parabrisas o en el marco de la puerta.", enlace: ["/bastidor", "Decodificar el bastidor"] },
      { id: "doc-itv", texto: "La ITV está en vigor", enlace: ["/itv", "Calcular cuándo le toca"] },
      { id: "doc-informe", texto: "El informe de la DGT no tiene cargas, embargos ni reserva de dominio", ayuda: "Si tiene alguno, no podrás ponerlo a tu nombre hasta que se levante." },
      { id: "doc-ivtm", texto: "El impuesto de circulación del año está pagado" },
      { id: "doc-libro", texto: "Hay libro de mantenimiento o facturas de las revisiones" },
      { id: "doc-llaves", texto: "Te dan todas las llaves (y la tarjeta o el código si la radio lo pide)" },
    ],
  },
  {
    titulo: "Historial y kilómetros",
    puntos: [
      { id: "his-km", texto: "Los kilómetros cuadran con las revisiones y las ITV anteriores", ayuda: "Una bajada de kilómetros entre dos inspecciones es señal de manipulación." },
      { id: "his-fallos", texto: "Has mirado los fallos comunes de ese modelo y motor", enlace: ["/coches", "Ver fichas con fallos comunes"] },
      { id: "his-importado", texto: "Si es importado, has revisado su historial en el país de origen" },
      { id: "his-anio", texto: "La matrícula cuadra con el año que dice el vendedor", enlace: ["/matricula", "Comprobar el año por la matrícula"] },
    ],
  },
  {
    titulo: "Exterior",
    puntos: [
      { id: "ext-pintura", texto: "No hay diferencias de color ni de holgura entre puertas, capó y aletas", ayuda: "Indican reparaciones por golpes." },
      { id: "ext-oxido", texto: "No hay óxido en los bajos, los pasos de rueda ni el borde de las puertas" },
      { id: "ext-ruedas", texto: "Los neumáticos tienen dibujo suficiente y se gastan por igual", ayuda: "Un desgaste irregular puede ser un problema de alineación o de suspensión." },
      { id: "ext-cristales", texto: "Cristales y faros sin grietas ni humedad dentro" },
    ],
  },
  {
    titulo: "Interior",
    puntos: [
      { id: "int-desgaste", texto: "El desgaste del volante, el pomo y los pedales cuadra con los kilómetros" },
      { id: "int-testigos", texto: "Al arrancar se encienden los testigos del cuadro y luego se apagan todos" },
      { id: "int-clima", texto: "El aire acondicionado enfría y la calefacción calienta" },
      { id: "int-electronica", texto: "Funcionan elevalunas, cierre centralizado, luces, multimedia y cámara" },
      { id: "int-humedad", texto: "No huele a humedad ni hay manchas de agua en alfombras o maletero" },
    ],
  },
  {
    titulo: "Motor (mejor en frío)",
    puntos: [
      { id: "mot-frio", texto: "Arranca bien con el motor frío", ayuda: "Pide que no lo arranquen antes de que llegues." },
      { id: "mot-humo", texto: "No echa humo azul (quema aceite) ni negro en exceso" },
      { id: "mot-fugas", texto: "No hay fugas de aceite ni de refrigerante bajo el coche ni en el motor" },
      { id: "mot-ruidos", texto: "No hace ruidos metálicos ni golpeteos al ralentí" },
    ],
  },
  {
    titulo: "Prueba en marcha",
    puntos: [
      { id: "pru-embrague", texto: "El embrague no patina y no coge muy arriba" },
      { id: "pru-cambio", texto: "Las marchas entran suaves; si es automático, no da tirones" },
      { id: "pru-frenos", texto: "Frena recto y sin vibraciones en el volante" },
      { id: "pru-direccion", texto: "No se desvía al soltar el volante en recta" },
      { id: "pru-suspension", texto: "No hay golpes ni crujidos al pasar badenes" },
    ],
  },
  {
    titulo: "La compra",
    puntos: [
      { id: "com-contrato", texto: "Firmáis un contrato de compraventa con los datos de los dos", enlace: ["/contrato-compraventa-coche", "Rellenar el contrato"] },
      { id: "com-pago", texto: "Pagas por transferencia o cheque bancario, no en efectivo" },
      { id: "com-coste", texto: "Sabes cuánto costará el cambio de nombre", enlace: ["/coste-transferencia", "Calcular la transferencia"] },
      { id: "com-seguro", texto: "Tienes el seguro contratado antes de llevártelo" },
    ],
  },
];

export const TOTAL = GRUPOS.reduce((n, g) => n + g.puntos.length, 0);
