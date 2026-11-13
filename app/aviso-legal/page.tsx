import type { Metadata } from "next";
import { metadatos } from "../lib/seo";
import PaginaLegal from "../components/PaginaLegal";
import { LEGAL } from "../datos-legales";
import styles from "../legal.module.css";

export const metadata: Metadata = metadatos({
  titulo: "Aviso legal",
  descripcion:
    "Datos del titular, condiciones de uso y limitaciones de responsabilidad de ¿Qué coche es?, el servicio gratuito que identifica un coche a partir de una foto.",
  ruta: "/aviso-legal",
});

export default function AvisoLegal() {
  return (
    <PaginaLegal titulo="Aviso legal">
      <h2>1. Datos del titular</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la
        información y de comercio electrónico, te informamos de que este sitio
        web es titularidad de:
      </p>
      <dl className={styles.datos}>
        <div className={styles.fila}>
          <dt>Titular</dt>
          <dd>{LEGAL.titular}</dd>
        </div>
        <div className={styles.fila}>
          <dt>NIF</dt>
          <dd>{LEGAL.nif}</dd>
        </div>
        <div className={styles.fila}>
          <dt>Domicilio</dt>
          <dd>{LEGAL.domicilio}</dd>
        </div>
        <div className={styles.fila}>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
          </dd>
        </div>
        <div className={styles.fila}>
          <dt>Sitio web</dt>
          <dd>{LEGAL.web}</dd>
        </div>
        <div className={styles.fila}>
          <dt>Datos registrales</dt>
          <dd>Persona física, sin inscripción en el Registro Mercantil</dd>
        </div>
      </dl>
      <p>
        La actividad de esta web no necesita autorización administrativa previa ni
        corresponde a una profesión regulada, y su titular no está adherido a ningún
        código de conducta. El servicio es gratuito: no se vende ningún producto ni
        servicio en la web. Puedes escribir al email indicado para cualquier consulta;
        te responderemos lo antes posible.
      </p>

      <h2>2. Objeto del sitio</h2>
      <p>
        {LEGAL.nombreWeb} es un servicio gratuito que, a partir de una foto,
        usa inteligencia artificial para identificar un coche y ofrecer datos
        orientativos sobre él: modelo, ficha técnica, precio aproximado y
        vehículos parecidos.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>Al usar la web te comprometes a:</p>
      <ul>
        <li>Usarla de forma lícita y sin perjudicar a terceros ni al servicio.</li>
        <li>
          Subir solo fotos de las que tengas derecho a usar, evitando imágenes
          en las que se identifique a personas sin su consentimiento, a menores
          o que contengan contenido ilícito.
        </li>
        <li>
          No intentar eludir los límites de uso, sobrecargar el servicio ni
          acceder a él de forma automatizada sin nuestro permiso.
        </li>
      </ul>
      <p>
        Podemos limitar o suspender el acceso, total o parcialmente, si
        detectamos un uso abusivo o por motivos técnicos.
      </p>

      <h2>4. Información generada por inteligencia artificial</h2>
      <p>
        Los resultados los genera un sistema de inteligencia artificial y son
        orientativos. Pueden contener errores en la marca, el modelo, la
        versión, las características técnicas o los precios. No constituyen una
        tasación, una oferta ni un asesoramiento profesional. Antes de comprar
        o vender un vehículo, verifica los datos con fuentes oficiales y con un
        profesional. No nos hacemos responsables de las decisiones que tomes a
        partir de esta información.
      </p>

      <h2>5. Disponibilidad del servicio</h2>
      <p>
        No garantizamos que la web funcione de forma continua ni libre de
        errores. El servicio depende de proveedores externos y puede
        interrumpirse, cambiar o dejar de ofrecerse sin previo aviso.
      </p>

      <h2>6. Propiedad intelectual e industrial</h2>
      <p>
        El diseño, los textos, el código y el logotipo de este sitio son de su
        titular o se usan con la debida autorización, y no pueden copiarse ni
        reutilizarse sin permiso. Los nombres de marcas y modelos de vehículos
        pertenecen a sus respectivos propietarios y se mencionan solo para
        identificar los coches; su uso no implica relación alguna con ellos.
      </p>

      <h2>7. Enlaces</h2>
      <p>
        Si el sitio incluye enlaces a páginas de terceros, no controlamos su
        contenido y no respondemos de él.
      </p>
      <p>
        Algunos enlaces son de afiliado y aparecen identificados como tales: si
        contratas un servicio a través de ellos, podemos recibir una comisión sin que
        te cueste más. No influyen en las identificaciones ni en las fichas. Al
        pulsarlos sales de esta web y se aplican las condiciones y la política de
        privacidad del tercero.
      </p>

      <h2>8. Protección de datos</h2>
      <p>
        El tratamiento de tus datos personales se explica en nuestra{" "}
        <a href="/privacidad">política de privacidad</a>.
      </p>

      <h2>9. Legislación y jurisdicción</h2>
      <p>
        Este aviso se rige por la legislación española. Para cualquier
        controversia serán competentes los juzgados y tribunales que
        correspondan conforme a la normativa aplicable y, si eres consumidor,
        los de tu domicilio.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podemos modificar este aviso cuando cambie el servicio o la normativa.
        Siempre se aplicará la versión publicada en esta página.
      </p>
    </PaginaLegal>
  );
}
