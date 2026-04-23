const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  // 1. Normalizamos el rol a minúsculas para evitar fallos de escritura
  const role = (req.headers['x-role'] || '').toLowerCase();
  const vetId = req.headers['x-vet-id'];
  const nombre = req.query.nombre;

  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 2. Aplicar el ROLE según lo que venga del frontend
    if (role === 'veterinario') {
      await client.query('SET ROLE rol_veterinario');
      if (vetId) {
        await client.query('SET LOCAL app.current_vet_id = $1', [vetId]);
      }
    } else if (role === 'recepcion') {
      await client.query('SET ROLE rol_recepcion');
    } else {
      // Por defecto para que no falle el fetch, usamos el admin si no hay rol
      await client.query('SET ROLE rol_administrador');
    }

    // 3. Consulta básica
    let queryText = 'SELECT * FROM mascotas';
    let queryParams = [];

    if (nombre) {
      queryText += ' WHERE nombre ILIKE $1';
      queryParams.push(`%${nombre}%`);
    }

    const result = await client.query(queryText, queryParams);
    await client.query('COMMIT');

    res.json({
      rol: role,
      total: result.rowCount,
      mascotas: result.rows
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("ERROR CRÍTICO:", err.message);
    // Enviamos un array vacío en lugar de un error para que el frontend no explote
    res.json({ rol: role, total: 0, mascotas: [], error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;