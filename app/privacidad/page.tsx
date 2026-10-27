import type { Metadata } from "next";
import { metadatos } from "../lib/seo";
import PaginaLegal from "../components/PaginaLegal";
import { LEGAL } from "../datos-legales";

export const metadata: Metadata = metadatos({
  titulo: "Política de privacidad",
  descripcion:
    "Qué datos trata Coches AI, con qué finalidad, quién los recibe y cuáles son tus derechos.",
  ruta: "/privacidad",
});

export default function Privacidad() {
    return (
        <PaginaLegal titulo="Política de privacidad">
            <p>
                Aquí te explicamos, de forma clara, qué pasa con tus datos cuando usas{" "}
                {LEGAL.nombreWeb} ({LEGAL.web}).
            </p>

            <h2>1. Quién es el responsable</h2>
            <div style={{ margin: "12px 0" }}>
                <ul>
                    <li>
                        <strong>Responsable:</strong> {LEGAL.titular}
                    </li>
                    <li>
                        <strong>NIF:</strong> {LEGAL.nif}
                    </li>
                    <li>
                        <strong>Domicilio:</strong> {LEGAL.domicilio}
                    </li>
                    <li>
                        <strong>Contacto:</strong> {LEGAL.email}
                    </li>
                </ul>
            </div>

            <h2>2. Qué datos tratamos y para qué</h2>
            <ul>
                <li>
                    <strong>La foto que subes.</strong> La usamos únicamente para
                    identificar el coche y mostrarte el resultado. La base legal es que
                    tú nos pides ese servicio (art. 6.1.b del RGPD). Nuestro servidor no
                    guarda la foto: la procesa en el momento y la envía a Google Gemini
                    para su análisis. Si en la imagen aparecen personas, matrículas u
                    otros datos personales, también se envían, por lo que te pedimos que
                    no subas fotos así.
                </li>
                <li>
                    <strong>El resultado del análisis.</strong> Cuando la IA identifica un
                    coche, guardamos su ficha (marca, modelo, datos técnicos, precio
                    estimado y coches parecidos) durante 30 días para que funcione el
                    enlace de «Compártelo». No incluye la foto, tu IP ni ningún dato
                    tuyo, y cualquiera que tenga el enlace puede verla.
                </li>
                <li>
                    <strong>La matrícula que consultes.</strong> El cálculo de la fecha y
                    la etiqueta se hace en tu navegador: la matrícula no se envía a
                    nuestro servidor.
                </li>
                <li>
                    <strong>Tu dirección IP.</strong> La usamos para limitar el número de
                    análisis por persona y evitar abusos que dejarían el servicio sin
                    funcionar. La base legal es nuestro interés legítimo en proteger el
                    servicio (art. 6.1.f del RGPD). Se guarda de forma temporal en una
                    base de datos de control de uso, solo durante el periodo de control
                    (hasta una hora, aproximadamente).
                </li>
                <li>
                    <strong>Registros técnicos.</strong> El proveedor de alojamiento
                    registra datos técnicos de las visitas y de los errores (como la IP).
                    Los usamos para mantener la web segura y corregir fallos.
                </li>
                <li>
                    <strong>Lo que nos escribas por correo.</strong> Si nos contactas,
                    usaremos tu mensaje y tu email solo para responderte.
                </li>
                <li>
                    <strong>El botón «¿Ha acertado?».</strong> Si lo pulsas, sumamos 1 a un
                    contador anónimo de síes o noes. El voto no se asocia a tu foto, al
                    resultado ni a ti.
                </li>
                <li>
                    <strong>Estadísticas de uso anónimas.</strong> Para saber qué
                    contenidos interesan y mejorar la web, al ver una página o usar una
                    herramienta tu navegador nos avisa de forma anónima y sumamos 1 a
                    contadores diarios: la página vista, la web de la que vienes (solo el
                    dominio, por ejemplo google.com), el tipo de dispositivo (móvil,
                    tablet u ordenador), la hora y datos generales del uso de las
                    herramientas, como la comunidad elegida en la calculadora de ITP, un
                    tramo de precio o la primera letra de la matrícula consultada (nunca
                    la matrícula, el bastidor ni los importes exactos). Si identificas un
                    coche, contamos qué modelo es. No usamos cookies ni guardamos nada en
                    tu navegador para esto, y los contadores no incluyen tu IP ni ningún
                    identificador, así que no permiten saber quién eres. Tu IP solo se
                    usa durante un minuto para limitar avisos repetidos. La base legal es
                    nuestro interés legítimo en conocer el uso agregado del servicio
                    (art. 6.1.f del RGPD).
                </li>
            </ul>
            <p>No te pedimos registro, nombre ni correo para usar la web.</p>

            <h2>3. Quién recibe los datos</h2>
            <p>Para prestar el servicio usamos estos proveedores:</p>
            <ul>
                <li>
                    <strong>Google (API de Gemini):</strong> analiza la foto. En el plan
                    gratuito de esta API, Google puede usar el contenido enviado para
                    mejorar sus productos y personas de su equipo pueden revisarlo. Es
                    otro motivo para no subir fotos con información personal.
                </li>
                <li>
                    <strong>Vercel:</strong> aloja la web y ejecuta el servidor.
                </li>
                <li>
                    <strong>Upstash:</strong> guarda temporalmente el contador de uso
                    asociado a la IP, las fichas de los resultados compartidos y las
                    estadísticas de uso anónimas.
                </li>
            </ul>
            <p>
                Estos proveedores pueden tratar datos fuera del Espacio Económico
                Europeo, por ejemplo en Estados Unidos. Lo hacen apoyándose en las
                garantías que prevé el RGPD, como el Marco de Privacidad de Datos
                UE-EE. UU. o las cláusulas contractuales tipo, según cada proveedor. No
                vendemos tus datos ni los cedemos a nadie más.
            </p>

            <h2>4. Cuánto tiempo los conservamos</h2>
            <ul>
                <li>La foto: no la conservamos en nuestros servidores.</li>
                <li>La ficha del resultado: 30 días; después se borra sola.</li>
                <li>La IP en el control de uso: hasta que termina el periodo de control.</li>
                <li>Las estadísticas de uso anónimas: 90 días; después se borran solas.</li>
                <li>
                    Los registros técnicos: el tiempo que indique el proveedor de
                    alojamiento.
                </li>
                <li>
                    Los correos que nos envíes: el tiempo necesario para atenderte y,
                    después, durante los plazos legales aplicables.
                </li>
            </ul>

            <h2>5. Tus derechos</h2>
            <p>
                Puedes pedirnos acceso a tus datos, rectificarlos, suprimirlos,
                oponerte a su tratamiento, limitarlo o solicitar su portabilidad.
                Escríbenos a {LEGAL.email} indicando qué derecho quieres ejercer. Si
                sientes que no hemos tratado bien tus datos, puedes reclamar ante la
                Agencia Española de Protección de Datos (
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                    www.aepd.es
                </a>
                ).
            </p>

            <h2 id="cookies">6. Cookies</h2>
            <p>
                Esta web no usa cookies publicitarias. Las estadísticas propias del
                punto 2 no usan cookies. Antes de tu elección solo usamos
                el almacenamiento local estrictamente necesario para recordar tu
                preferencia (<code>cochesai.analytics-consent</code>). Las cookies
                analíticas opcionales de Google Analytics solo se activan después de
                aceptar expresamente. Si las rechazas, no se carga la etiqueta de
                Analytics. Puedes cambiar tu decisión en cualquier momento desde el
                botón «Cambiar preferencias de cookies».
            </p>
            <p>
                Google Analytics puede crear cookies propias como <code>_ga</code> y
                <code>_ga_*</code> para medir visitas y uso agregado del servicio. No
                usamos cookies publicitarias ni funciones de personalización de
                anuncios. La información sobre las cookies y sus plazos puede cambiar
                cuando Google actualiza el servicio; consulta también su documentación
                de Analytics.
            </p>

            <h2>7. Menores</h2>
            <p>
                El servicio está pensado para mayores de 14 años. Si eres menor, usa la
                web con permiso de tus padres o tutores.
            </p>

            <h2>8. Cambios en esta política</h2>
            <p>
                Podemos actualizar esta política si cambia el servicio o la normativa.
                La fecha de la última revisión aparece al principio de la página.
            </p>
        </PaginaLegal>
    );
}
