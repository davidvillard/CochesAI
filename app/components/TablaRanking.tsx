import Link from "next/link";
import styles from "./Ventas.module.css";
import { modelo, unidades } from "../lib/ventas";
import { urlFicha } from "../lib/fichas";

// Ranking de modelos. Si el modelo tiene ficha, el nombre enlaza a ella.
export default function TablaRanking({
  filas,
  fichas,
  columna,
}: {
  filas: [clave: string, unidades: number][];
  fichas: Map<string, string>;
  columna: string;
}) {
  return (
    <div className={styles.tablaCaja}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Modelo</th>
            <th scope="col" className={styles.num}>
              {columna}
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([clave, n], i) => {
            const nombre = modelo(clave)?.nombre ?? clave;
            const ficha = fichas.get(clave);
            return (
              <tr key={clave}>
                <td>{i + 1}</td>
                <td>{ficha ? <Link href={urlFicha(ficha)}>{nombre}</Link> : nombre}</td>
                <td className={styles.num}>{unidades(n)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
