// Función de Netlify: puente entre la página y la base de datos Neon.
// La cadena de conexión vive solo en la variable de entorno NEON_DATABASE_URL.
const { neon } = require('@neondatabase/serverless');

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : null);

exports.handler = async (event) => {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) return json(500, { error: 'Falta la variable NEON_DATABASE_URL' });
  const sql = neon(url);

  try {
    if (event.httpMethod === 'GET') {
      const [asignaturas, estudiantes, sesiones, marcajes, rechazos] = await Promise.all([
        sql`select id, nombre, aula from asignatura order by nombre`,
        sql`select id, codigo, nombre, creado from estudiante order by id`,
        sql`select id, asignatura_id, to_char(fecha, 'YYYY-MM-DD') as fecha from sesion order by fecha`,
        sql`select sesion_id, estudiante_id, hora, score from marcaje order by hora`,
        sql`select asignatura_id, hora, score from intento_rechazado order by hora`,
      ]);
      return json(200, { asignaturas, estudiantes, sesiones, marcajes, rechazos });
    }

    if (event.httpMethod !== 'POST') return json(405, { error: 'Método no permitido' });
    let b;
    try { b = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'JSON inválido' }); }

    if (b.accion === 'marcaje') {
      const asig = str(b.asignatura_id, 40), est = int(b.estudiante_id), score = int(b.score);
      const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || '') ? b.fecha : null;
      if (!asig || est === null || !fecha) return json(400, { error: 'Datos incompletos' });
      const [se] = await sql`
        insert into sesion (asignatura_id, fecha) values (${asig}, ${fecha})
        on conflict (asignatura_id, fecha) do update set fecha = excluded.fecha returning id`;
      await sql`
        insert into marcaje (sesion_id, estudiante_id, score) values (${se.id}, ${est}, ${score})
        on conflict (sesion_id, estudiante_id) do nothing`;
      return json(201, { ok: true });
    }

    if (b.accion === 'estudiante') {
      const codigo = str(b.codigo, 40), nombre = str(b.nombre, 120), tpl = str(b.plantilla_id, 40) || null;
      if (!codigo || !nombre) return json(400, { error: 'Datos incompletos' });
      try {
        const [r] = await sql`
          insert into estudiante (codigo, nombre, plantilla_id) values (${codigo}, ${nombre}, ${tpl}) returning id`;
        return json(201, { id: Number(r.id) });
      } catch (e) {
        if (e && e.code === '23505') return json(409, { error: 'El código ya existe' });
        throw e;
      }
    }

    if (b.accion === 'rechazo') {
      const asig = str(b.asignatura_id, 40), score = int(b.score);
      if (!asig) return json(400, { error: 'Datos incompletos' });
      await sql`insert into intento_rechazado (asignatura_id, score) values (${asig}, ${score})`;
      return json(201, { ok: true });
    }

    return json(400, { error: 'Acción desconocida' });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Error de base de datos' });
  }
};
