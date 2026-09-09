import { Link } from 'react-router'

export function NotFound() {
  return (
    <article className="modulo" aria-labelledby="titulo-modulo">
      <h1 id="titulo-modulo" className="modulo-titulo">
        Página no encontrada
      </h1>
      <p className="modulo-descripcion">
        La ruta solicitada no corresponde a ningún módulo del sistema.
      </p>
      <Link className="enlace-volver" to="/">
        Volver al dashboard
      </Link>
    </article>
  )
}
