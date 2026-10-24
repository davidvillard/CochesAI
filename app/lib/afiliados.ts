// Enlaces de afiliado. Pega aquí la URL que te dé cada programa al darte de alta
// (con tu código de afiliado). Las ofertas con url vacía no se muestran en la web.
// Los enlaces pasan por /ir/<id>, que cuenta el clic en las estadísticas y redirige.

export type Oferta = {
  id: string;
  titulo: string;
  texto: string;
  boton: string;
  url: string;
};

export const OFERTAS: Oferta[] = [
  {
    id: "historial",
    titulo: "Informe de historial del coche",
    texto:
      "Kilómetros, accidentes, robos y su historial en otros países. Muy recomendable si es importado.",
    boton: "Ver su historial",
    url: "", // por ejemplo, tu enlace de afiliado de carVertical
  },
  {
    id: "dgt",
    titulo: "Informe oficial de la DGT",
    texto: "Titulares, cargas y embargos, ITV y kilometraje registrado en la DGT.",
    boton: "Pedir el informe",
    url: "", // por ejemplo, el enlace de afiliado de una gestoría
  },
  {
    id: "seguro",
    titulo: "Compara seguros de coche",
    texto: "Mira cuánto te costaría asegurarlo antes de comprarlo.",
    boton: "Comparar seguros",
    url: "", // por ejemplo, el enlace de afiliado de un comparador
  },
];

export const ofertasActivas = () => OFERTAS.filter((o) => o.url);
