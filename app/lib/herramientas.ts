import {
  BarcodeLinearIcon,
  CalculatorLinearIcon,
  CalendarMarkLinearIcon,
  ChecklistMinimalisticLinearIcon,
  CupStarLinearIcon,
  DocumentTextLinearIcon,
  GraphUpLinearIcon,
  MagnifierLinearIcon,
  ScaleLinearIcon,
  TransferHorizontalLinearIcon,
} from "@solar-icons/react";

// Todas las herramientas gratuitas: las usan el menú, la página /herramientas y el sitemap
export const HERRAMIENTAS = [
  { href: "/matricula", texto: "Año y etiqueta por matrícula", detalle: "Fecha de matriculación y etiqueta DGT", Icono: MagnifierLinearIcon },
  { href: "/ultima-matricula", texto: "Última matrícula hoy", detalle: "Y la que le toca a un coche nuevo", Icono: GraphUpLinearIcon },
  { href: "/bastidor", texto: "Decodificar bastidor (VIN)", detalle: "Fabricante, país y año", Icono: BarcodeLinearIcon },
  { href: "/mas-vendidos", texto: "Coches más vendidos", detalle: "Ranking DGT de España y por provincia", Icono: CupStarLinearIcon },
  { href: "/comparar", texto: "Comparar coches", detalle: "Dos modelos lado a lado", Icono: ScaleLinearIcon },
  { href: "/checklist-compra-coche", texto: "Checklist de compra", detalle: "Qué revisar en un coche usado", Icono: ChecklistMinimalisticLinearIcon },
  { href: "/calculadora-itp", texto: "Calculadora de ITP", detalle: "El impuesto al comprar un usado", Icono: CalculatorLinearIcon },
  { href: "/coste-transferencia", texto: "Coste de la transferencia", detalle: "ITP, tasa DGT y gestoría", Icono: TransferHorizontalLinearIcon },
  { href: "/contrato-compraventa-coche", texto: "Contrato de compraventa", detalle: "Rellénalo e imprímelo", Icono: DocumentTextLinearIcon },
  { href: "/itv", texto: "Cuándo toca la ITV", detalle: "Según la fecha de matriculación", Icono: CalendarMarkLinearIcon },
];
