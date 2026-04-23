const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/mascotas
router.get('/', async (req, res) => {
  const role = req.headers['x-role'];
  const vetId = req.headers['x-vet-id'];
  const nombre = req.query.nombre;

  const client = await db.pool.connect();
  
  try {
    // Iniciar transacción requerida para usar SET LOCAL
    await client.query('BEGIN');

    // 3. Aplicar contexto para RLS si es veterinario
    if (role === 'veterinario') {
      if (!vetId) throw new Error('Se requiere el header X-Vet-Id para el rol veterinario');
      await client.query('SET LOCAL app.current_vet_id = $1', [vetId]);
    }

    // 4. Construir la query de búsqueda con placeholders (evita SQL Injection)
    let queryText = 'SELECT * FROM mascotas';
    let queryParams = [];

    if (nombre) {
      queryText += ' WHERE nombre ILIKE $1';
      queryParams.push(`%${nombre}%`);
    }

    // 5. Ejecutar query
    const result = await client.query(queryText, queryParams);
    
    // Confirmar transacción
    await client.query('COMMIT');

    // Responder resultados
    res.json({
      rol: role || 'no especificado',
      total: result.rowCount,
      mascotas: result.rows
    });

  } catch (err) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Error interno del servidor al obtener mascotas' });
  } finally {
    // 6. Liberar el cliente del pool siempre
    client.release();
  }
});

module.exports = router;