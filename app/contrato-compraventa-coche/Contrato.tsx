"use client";

import { useState } from "react";
import styles from "./contrato.module.css";
import { eurExacto } from "../lib/formato";
import { medir } from "../lib/medir";

// Los datos solo viven en esta página: no se envían ni se guardan en ningún sitio
type Persona = { nombre: string; dni: string; domicilio: string };
const vacia: Persona = { nombre: "", dni: "", domicilio: "" };

const PAGOS = ["transferencia bancaria", "cheque bancario", "efectivo", "Bizum"];

// Hueco para rellenar a mano si el campo está vacío
const o = (v: string, largo = 24) => v.trim() || "_".repeat(largo);

export default function Contrato() {
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [vendedor, setVendedor] = useState<Persona>(vacia);
  const [comprador, setComprador] = useState<Persona>(vacia);
  const [marca, setMarca] = useState("");
  const [matricula, setMatricula] = useState("");
  const [bastidor, setBastidor] = useState("");
  const [km, setKm] = useState("");
  const [precio, setPrecio] = useState("");
  const [pago, setPago] = useState(PAGOS[0]);
  const [senal, setSenal] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [itv, setItv] = useState("");
  const [llaves, setLlaves] = useState("2");
  const [defectos, setDefectos] = useState("");

  const fechaLarga = (f: string) =>
    f ? new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";
  const fechaTexto = fechaLarga(fecha);
  const euros = (v: string) => {
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    return n > 0 ? n : 0;
  };
  const precioNum = euros(precio);
  const precioTexto = precioNum > 0 ? eurExacto(precioNum) : "";
  const senalNum = euros(senal);

  const campo = (
    etiqueta: string,
    valor: string,
    cambiar: (v: string) => void,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <label className={styles.campo}>
      <span>{etiqueta}</span>
      <input value={valor} onChange={(e) => cambiar(e.target.value)} autoComplete="off" {...extra} />
    </label>
  );

  const persona = (titulo: string, p: Persona, cambiar: (p: Persona) => void) => (
    <fieldset className={styles.grupo}>
      <legend>{titulo}</legend>
      {campo("Nombre y apellidos", p.nombre, (v) => cambiar({ ...p, nombre: v }))}
      {campo("DNI o NIE", p.dni, (v) => cambiar({ ...p, dni: v }))}
      {campo("Domicilio", p.domicilio, (v) => cambiar({ ...p, domicilio: v }))}
    </fieldset>
  );

  return (
    <div className={styles.envoltorio}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <fieldset className={styles.grupo}>
          <legend>Lugar y fecha</legend>
          {campo("Lugar de la firma", lugar, setLugar, { placeholder: "Vigo" })}
          {campo("Fecha", fecha, setFecha, { type: "date" })}
          {campo("Día de entrega del coche (si no es el de la firma)", fechaEntrega, setFechaEntrega, { type: "date" })}
          {campo("Hora de entrega del coche", hora, setHora, { type: "time" })}
        </fieldset>
        {persona("Vendedor", vendedor, setVendedor)}
        {persona("Comprador", comprador, setComprador)}
        <fieldset className={styles.grupo}>
          <legend>Vehículo y precio</legend>
          {campo("Marca y modelo", marca, setMarca, { placeholder: "SEAT León 1.5 TSI" })}
          {campo("Matrícula", matricula, setMatricula, { placeholder: "1234 BCD" })}
          {campo("Número de bastidor", bastidor, setBastidor)}
          {campo("Kilómetros", km, setKm, { inputMode: "numeric" })}
          {campo("ITV en vigor hasta", itv, setItv, { type: "date" })}
          {campo("Llaves que se entregan", llaves, setLlaves, { inputMode: "numeric" })}
          <label className={`${styles.campo} ${styles.ancho}`}>
            <span>Defectos o averías conocidas (escribe «ninguno» si no hay)</span>
            <textarea
              value={defectos}
              onChange={(e) => setDefectos(e.target.value)}
              rows={3}
              placeholder="Golpe en el paragolpes trasero, el aire acondicionado no enfría…"
            />
          </label>
          {campo("Precio total (€)", precio, setPrecio, { inputMode: "decimal" })}
          {campo("Señal ya pagada, si la hubo (€)", senal, setSenal, { inputMode: "decimal" })}
          <label className={styles.campo}>
            <span>Forma de pago</span>
            <select value={pago} onChange={(e) => setPago(e.target.value)}>
              {PAGOS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </fieldset>
      </form>

      <div className={styles.barra}>
        <p>
          Rellena lo que sepas: los huecos vacíos salen en blanco para escribirlos a mano.
          Imprime dos copias y firmad las dos.
        </p>
        <button type="button" onClick={() => {
          medir(["imprimir", "contrato"]);
          window.print();
        }}>
          Imprimir o guardar en PDF
        </button>
      </div>

      <article className={styles.documento} aria-label="Contrato">
        <h2>Contrato de compraventa de vehículo entre particulares</h2>
        <p className={styles.derecha}>
          En {o(lugar, 16)}, a {o(fechaTexto, 20)}
        </p>

        <h3>Reunidos</h3>
        <p>
          De una parte, como <strong>vendedor</strong>, D./D.ª {o(vendedor.nombre, 32)}, con
          DNI/NIE {o(vendedor.dni, 12)} y domicilio en {o(vendedor.domicilio, 40)}.
        </p>
        <p>
          De otra parte, como <strong>comprador</strong>, D./D.ª {o(comprador.nombre, 32)},
          con DNI/NIE {o(comprador.dni, 12)} y domicilio en {o(comprador.domicilio, 40)}.
        </p>
        <p>Ambas partes se reconocen capacidad legal para firmar este contrato y acuerdan:</p>

        <h3>Cláusulas</h3>
        <ol>
          <li>
            El vendedor vende al comprador el vehículo marca y modelo {o(marca, 28)}, con
            matrícula {o(matricula, 10)}, número de bastidor {o(bastidor, 20)} y{" "}
            {o(km, 8)} kilómetros.
          </li>
          <li>
            El precio total es de {o(precioTexto, 12)}.{" "}
            {senalNum > 0 && senalNum < precioNum ? (
              <>
                El comprador ya entregó {eurExacto(senalNum)} como señal a cuenta del precio, y
                paga en este acto los {eurExacto(precioNum - senalNum)} restantes mediante {pago}.
              </>
            ) : (
              <>El vendedor declara recibirlo en este acto mediante {pago}.</>
            )}{" "}
            Este documento sirve como carta de pago.
          </li>
          <li>
            El vendedor declara que es el titular del vehículo, que este no tiene cargas,
            embargos ni reserva de dominio, que está al corriente del impuesto de circulación
            y que no le consta ninguna multa pendiente asociada al vehículo.
          </li>
          <li>
            El vehículo tiene la ITV en vigor hasta el {o(fechaLarga(itv), 16)}.{" "}
            El vendedor informa de estos defectos o averías conocidos (o «ninguno»):{" "}
            {o(defectos, 60)}.{" "}
            El comprador declara conocer el estado del vehículo, que ha examinado y probado,
            y lo acepta, sin perjuicio de la responsabilidad del vendedor por vicios ocultos
            según el Código Civil.
          </li>
          <li>
            Junto con el vehículo se entregan el permiso de circulación, la ficha técnica
            (tarjeta ITV) y {o(llaves, 3)} llave(s), además del libro de mantenimiento y las
            facturas de reparaciones si las hay.
          </li>
          <li>
            El vehículo se entrega el {o(fechaLarga(fechaEntrega) || fechaTexto, 20)} a las{" "}
            {o(hora, 6)} horas. Desde ese momento, el comprador se hace responsable de las
            sanciones, daños y obligaciones que se deriven de su uso.
          </li>
          <li>
            El comprador se compromete a solicitar el cambio de titularidad en la DGT en el
            plazo legal de 30 días y a pagar el Impuesto de Transmisiones Patrimoniales.
            Los gastos de la transferencia corren a su cargo, salvo pacto en contrario.
          </li>
        </ol>

        <p>Y en prueba de conformidad, firman por duplicado en el lugar y la fecha indicados.</p>

        <div className={styles.firmas}>
          <div>
            <span>
              El vendedor
              <br />
              {o(vendedor.nombre, 24)}
              <br />
              DNI/NIE {o(vendedor.dni, 12)}
            </span>
          </div>
          <div>
            <span>
              El comprador
              <br />
              {o(comprador.nombre, 24)}
              <br />
              DNI/NIE {o(comprador.dni, 12)}
            </span>
          </div>
        </div>
      </article>

      <p className={styles.aviso}>
        Modelo orientativo para una compraventa entre particulares; no es asesoramiento
        jurídico. Los datos que escribes no salen de tu navegador ni se guardan.
      </p>
    </div>
  );
}
