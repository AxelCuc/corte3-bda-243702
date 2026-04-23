-- Vistas para reportes y caché
-- =============================================================
-- VISTAS DE NEGOCIO (REPORTES Y CACHÉ)
-- =============================================================

CREATE OR REPLACE VIEW v_mascotas_vacunacion_pendiente AS
WITH ultima_vacuna_por_mascota AS (
    SELECT 
        mascota_id, 
        MAX(fecha_aplicacion) as fecha_ultima
    FROM vacunas_aplicadas
    GROUP BY mascota_id
)
SELECT 
    m.id AS mascota_id,
    m.nombre AS nombre_mascota,
    m.especie,
    d.nombre AS nombre_dueno,
    d.telefono AS telefono_dueno,
    uv.fecha_ultima AS ultima_vacuna,
    CASE 
        WHEN uv.fecha_ultima IS NULL THEN 9999
        ELSE (CURRENT_DATE - uv.fecha_ultima)
    END AS dias_sin_vacuna,
    CASE 
        WHEN uv.fecha_ultima IS NULL THEN 'NUNCA VACUNADA'
        WHEN (CURRENT_DATE - uv.fecha_ultima) > 365 THEN 'VACUNACIÓN VENCIDA'
    END AS estado
FROM mascotas m
JOIN duenos d ON m.dueno_id = d.id
LEFT JOIN ultima_vacuna_por_mascota uv ON m.id = uv.mascota_id
WHERE uv.fecha_ultima IS NULL 
   OR (CURRENT_DATE - uv.fecha_ultima) > 365;

-- Comentario: Esta vista identifica mascotas que requieren atención inmediata.
-- Se recomienda invalidar la caché en Redis cuando se inserte en vacunas_aplicadas.