const express = require('express');
const router = express.Router();
const db = require('../db');
const redis = require('../cache');

// GET /api/vacunacion-pendiente
router.get('/', async (req, res) => {
  const CACHE_KEY = 'vacunacion_pendiente';
  const role = (req.headers['x-role'] || '').toLowerCase();
  const vetId = req.headers['x-vet-id'];

  try {
    // 1. Intentar leer de Redis (caché no depende de RLS porque es la vista global)
    const cachedData = await redis.get(CACHE_KEY);

    // 2. CACHE HIT
    if (cachedData) {
      console.log(`[${new Date().toISOString()}] [CACHE HIT] ${CACHE_KEY}`);
      return res.json({ 
        source: 'cache', 
        data: JSON.parse(cachedData) 
      });
    }

    // 3. CACHE MISS – necesitamos consultar la BD con el rol correcto
    console.log(`[${new Date().toISOString()}] [CACHE MISS] ${CACHE_KEY}`);
    const inicio = Date.now();

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Aplicar el rol para que RLS permita la consulta
      if (role === 'veterinario') {
        await client.query('SET ROLE rol_veterinario');
        if (vetId) {
          await client.query('SET LOCAL app.current_vet_id = $1', [vetId]);
        }
      } else if (role === 'recepcion') {
        await client.query('SET ROLE rol_recepcion');
      } else {
        await client.query('SET ROLE rol_administrador');
      }

      const result = await client.query('SELECT * FROM v_mascotas_vacunacion_pendiente');
      await client.query('COMMIT');

      const latencia = Date.now() - inicio;
      console.log(`[BD] Consulta completada en ${latencia}ms`);

      // Guardar en Redis con TTL de 300 segundos
      await redis.setex(CACHE_KEY, 300, JSON.stringify(result.rows));

      res.json({ 
        source: 'db', 
        data: result.rows 
      });
    } catch (innerErr) {
      await client.query('ROLLBACK');
      throw innerErr;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('ERROR vacunacion:', err.message);
    res.status(500).json({ error: 'Error al obtener el reporte de vacunación pendiente', detalle: err.message });
  }
});

module.exports = router;