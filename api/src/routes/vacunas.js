const express = require('express');
const router = express.Router();
const db = require('../db');
const redis = require('../cache');

// POST /api/vacunas
router.post('/', async (req, res) => {
  const role = req.headers['x-role'];
  const vetId = req.headers['x-vet-id'];
  const { mascota_id, vacuna_id, veterinario_id, costo_cobrado } = req.body;

  // 1. Validar que vengan todos los campos
  if (!mascota_id || !vacuna_id || !veterinario_id || costo_cobrado === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // 2. Obtener cliente del pool
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 3. Aplicar contexto RLS si es veterinario
    if (role === 'veterinario') {
      if (!vetId) throw new Error('Se requiere el header X-Vet-Id');
      await client.query('SET LOCAL app.current_vet_id = $1', [vetId]);
    }

    // 4. Insertar en vacunas_aplicadas con query parametrizada
    const insertQuery = `
      INSERT INTO vacunas_aplicadas 
      (mascota_id, vacuna_id, veterinario_id, fecha_aplicacion, costo_cobrado)
      VALUES ($1, $2, $3, CURRENT_DATE, $4)
      RETURNING id
    `;
    const result = await client.query(insertQuery, [mascota_id, vacuna_id, veterinario_id, costo_cobrado]);

    await client.query('COMMIT');

    // 5. Invalidar el caché de Redis
    await redis.del('vacunacion_pendiente');
    console.log(`[${new Date().toISOString()}] [CACHE INVALIDATED] vacunacion_pendiente`);

    // 6. Responder éxito
    res.json({ 
      mensaje: 'Vacuna aplicada correctamente', 
      id: result.rows[0].id 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al aplicar la vacuna' });
  } finally {
    // 7. Liberar cliente
    client.release();
  }
});

module.exports = router;