-- 1. Otorgar permisos de lectura a los roles (porque se borraron al hacer DROP TABLE)
GRANT SELECT ON mascotas TO rol_veterinario, rol_recepcion, rol_administrador;
GRANT SELECT ON vet_atiende_mascota TO rol_veterinario, rol_recepcion, rol_administrador;

-- 2. Habilitar la seguridad a nivel de fila (RLS) en la tabla mascotas
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

-- 3. Recrear tu política exacta para los veterinarios
CREATE POLICY policy_mascotas_vet ON mascotas
FOR SELECT
TO rol_veterinario
USING (
    EXISTS (
        SELECT 1 FROM vet_atiende_mascota vam 
        WHERE vam.mascota_id = mascotas.id 
        AND vam.vet_id = current_setting('app.current_vet_id', true)::int
    )
);

-- 4. Crear una política para que Recepción y Administrador puedan ver todas (sin filtro)
CREATE POLICY policy_mascotas_all ON mascotas
FOR SELECT
TO rol_recepcion, rol_administrador
USING (true);