const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/citas
router.post('/', async (req, res) => {
  const { mascota_id, veterinario_id, fecha_hora, motivo } = req.body;

  // 1. Validar campos requeridos
  if (!mascota_id || !veterinario_id || !fecha_hora || !motivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const client = await db.pool.connect();

  try {
    // 2. Llamar al procedure con query parametrizada
    // Se envía NULL al parámetro OUT 'p_cita_id' y Postgres devolverá el valor resultante
    const queryText = 'CALL sp_agendar_cita($1, $2, $3::TIMESTAMP, $4, NULL)';
    await client.query(queryText, [mascota_id, veterinario_id, fecha_hora, motivo]);
    
    // 3. Responder
    res.json({ mensaje: 'Cita agendada correctamente' });

  } catch (err) {
    // 4. Capturar excepciones arrojadas por la BD (Ej: vet descansa, vet inactivo)
    console.error('Error del Procedure:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/citas
router.get('/', async (req, res) => {
  const role = req.headers['x-role'];
  const vetId = req.headers['x-vet-id'];

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Aplicar RLS
    if (role === 'veterinario') {
      if (!vetId) throw new Error('Se requiere el header X-Vet-Id');
      await client.query('SET LOCAL app.current_vet_id = $1', [vetId]);
    }

    // Consulta con el RLS ya activo
    const result = await client.query('SELECT * FROM citas ORDER BY fecha_hora DESC');
    
    await client.query('COMMIT');

    res.json({
      total: result.rowCount,
      citas: result.rows
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al obtener las citas' });
  } finally {
    client.release();
  }
});

module.exports = router;