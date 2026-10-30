"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AltArrowDownLinearIcon,
  HamburgerMenuLinearIcon,
  CloseCircleLinearIcon,
} from "@solar-icons/react";
import base from "../page.module.css";
import styles from "./Cabecera.module.css";
import BotonFoto from "./BotonFoto";
import BotonInstalar from "./BotonInstalar";
import { HERRAMIENTAS as TODAS } from "../lib/herramientas";

const PRINCIPALES = [
  { href: "/coches", texto: "Fichas" },
  { href: "/matricula", texto: "Matrícula y etiqueta" },
];

// En el desplegable van todas menos las que ya están en el menú principal
const HERRAMIENTAS = TODAS.filter((h) => !PRINCIPALES.some((p) => p.href === h.href));

// Cabecera de todas las páginas. En la portada el botón abre la galería;
// en el resto lleva a la portada para identificar un coche.
export default function Cabecera({ enPortada = false }: { enPortada?: boolean }) {
  const ruta = usePathname();
  const [herramientas, setHerramientas] = useState(false);
  const [movil, setMovil] = useState(false);
  const desplegable = useRef<HTMLDivElement>(null);

  // Cierra los menús al cambiar de página
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHerramientas(false);
    setMovil(false);
  }, [ruta]);

  // Con el menú móvil abierto, la página de detrás no se mueve
  useEffect(() => {
    if (!movil) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    // Si la pantalla se ensancha (girar la tablet), el menú móvil desaparece: se cierra
    const ancho = matchMedia("(min-width: 860px)");
    const cerrar = () => ancho.matches && setMovil(false);
    ancho.addEventListener("change", cerrar);
    return () => {
      html.style.overflow = "";
      ancho.removeEventListener("change", cerrar);
    };
  }, [movil]);

  // Cierra con Escape o al pulsar fuera del desplegable
  useEffect(() => {
    if (!herramientas && !movil) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHerramientas(false);
        setMovil(false);
      }
    };
    const clic = (e: MouseEvent) => {
      if (!desplegable.current?.contains(e.target as Node)) setHerramientas(false);
    };
    document.addEventListener("keydown", tecla);
    document.addEventListener("click", clic);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("click", clic);
    };
  }, [herramientas, movil]);

  const actual = (href: string) => (ruta === href || ruta.startsWith(`${href}/`) ? "page" : undefined);
  const enHerramientas = HERRAMIENTAS.some((h) => actual(h.href));

  const accion = enPortada ? (
    <BotonFoto tipo="galeria" className={`${base.btn} ${base.btnP} ${base.btnS}`}>
      Subir foto
    </BotonFoto>
  ) : (
    <Link href="/" className={`${base.btn} ${base.btnP} ${base.btnS}`}>
      Identificar por foto
    </Link>
  );

  return (
    <header className={base.cab}>
      <div className={`${base.cont} ${base.cabIn}`}>
        <Link href="/" className={base.logo}>
          <NextImage
            className={base.logoImagen}
            src="/logo-quecochees.svg"
            alt="¿Qué coche es?, ir a la portada"
            width={217}
            height={122}
            priority
          />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          {/* Escritorio */}
          <div className={styles.escritorio}>
            {PRINCIPALES.map((l) => (
              <Link key={l.href} href={l.href} className={styles.enlace} aria-current={actual(l.href)}>
                {l.texto}
              </Link>
            ))}

            <div className={styles.desplegable} ref={desplegable}>
              <button
                type="button"
                className={`${styles.enlace} ${enHerramientas ? styles.activo : ""}`}
                aria-expanded={herramientas}
                aria-controls="menu-herramientas"
                onClick={() => setHerramientas((v) => !v)}
              >
                Herramientas
                <AltArrowDownLinearIcon size={16} className={styles.flecha} />
              </button>
              <div id="menu-herramientas" className={styles.panel} data-abierto={herramientas}>
                {HERRAMIENTAS.map(({ href, texto, detalle, Icono }) => (
                  <Link key={href} href={href} className={styles.opcion} aria-current={actual(href)}>
                    <span className={styles.opcionIc}>
                      <Icono size={20} />
                    </span>
                    <span>
                      <span className={styles.opcionT}>{texto}</span>
                      <span className={styles.opcionX}>{detalle}</span>
                    </span>
                  </Link>
                ))}
                <Link href="/herramientas" className={styles.todas}>
                  Ver todas las herramientas →
                </Link>
              </div>
            </div>
          </div>

          {accion}

          {/* Móvil */}
          <button
            type="button"
            className={styles.hamburguesa}
            aria-expanded={movil}
            aria-controls="menu-movil"
            aria-label={movil ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMovil((v) => !v)}
          >
            {movil ? <CloseCircleLinearIcon size={26} /> : <HamburgerMenuLinearIcon size={26} />}
          </button>
        </nav>
      </div>

      <div id="menu-movil" className={styles.movil} data-abierto={movil} inert={!movil}>
        <div className={styles.movilIn}>
          <Link href="/" className={styles.movilEnlace} aria-current={ruta === "/" ? "page" : undefined}>
            Identificar por foto
          </Link>
          {PRINCIPALES.map((l) => (
            <Link key={l.href} href={l.href} className={styles.movilEnlace} aria-current={actual(l.href)}>
              {l.texto}
            </Link>
          ))}
          <p className={styles.movilGrupo}>Herramientas</p>
          {HERRAMIENTAS.map(({ href, texto, detalle, Icono }) => (
            <Link key={href} href={href} className={styles.opcion} aria-current={actual(href)}>
              <span className={styles.opcionIc}>
                <Icono size={20} />
              </span>
              <span>
                <span className={styles.opcionT}>{texto}</span>
                <span className={styles.opcionX}>{detalle}</span>
              </span>
            </Link>
          ))}
          <BotonInstalar className={styles.instalar} ayudaClassName={styles.instalarAyuda} />
        </div>
      </div>
    </header>
  );
}
