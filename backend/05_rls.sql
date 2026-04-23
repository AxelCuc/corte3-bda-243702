-- Políticas de Row Level Security
-- =============================================================
-- 05. ROW LEVEL SECURITY (RLS) · CORTE 3
-- =============================================================

-- 1. Habilitar RLS en las tablas sensibles
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacunas_aplicadas ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. POLÍTICAS PARA LA TABLA: MASCOTAS
-- =============================================================

DROP POLICY IF EXISTS policy_mascotas_vet ON mascotas;
-- Protege la privacidad del paciente: El veterinario solo puede acceder a la información
-- de las mascotas que le han sido asignadas en la tabla 'vet_atiende_mascota'.
CREATE POLICY policy_mascotas_vet ON mascotas 
FOR SELECT 
TO rol_veterinario 
USING (
    EXISTS (
        SELECT 1 FROM vet_atiende_mascota 
        WHERE vet_atiende_mascota.mascota_id = mascotas.id 
        AND vet_atiende_mascota.vet_id = current_setting('app.current_vet_id', TRUE)::INT
    )
);

DROP POLICY IF EXISTS policy_mascotas_all ON mascotas;
-- Permisiva para Recepción y Administrador: Tienen acceso global a todos los pacientes.
CREATE POLICY policy_mascotas_all ON mascotas 
FOR ALL 
TO rol_recepcion, rol_administrador 
USING (TRUE) 
WITH CHECK (TRUE);


-- =============================================================
-- 3. POLÍTICAS PARA LA TABLA: CITAS
-- =============================================================

DROP POLICY IF EXISTS policy_citas_vet ON citas;
-- Protege la agenda: El veterinario solo puede ver y gestionar las citas 
-- donde él figura como el médico tratante.
CREATE POLICY policy_citas_vet ON citas 
FOR ALL 
TO rol_veterinario 
USING (veterinario_id = current_setting('app.current_vet_id', TRUE)::INT)
WITH CHECK (veterinario_id = current_setting('app.current_vet_id', TRUE)::INT);

DROP POLICY IF EXISTS policy_citas_all ON citas;
-- Permisiva para Recepción y Administrador: Pueden ver y gestionar la agenda global.
CREATE POLICY policy_citas_all ON citas 
FOR ALL 
TO rol_recepcion, rol_administrador 
USING (TRUE) 
WITH CHECK (TRUE);


-- =============================================================
-- 4. POLÍTICAS PARA LA TABLA: VACUNAS_APLICADAS
-- =============================================================

DROP POLICY IF EXISTS policy_vacunas_vet ON vacunas_aplicadas;
-- Protege el historial médico: El veterinario solo puede ver o registrar vacunas
-- para las mascotas que él atiende. (Recepción no tiene permisos GRANT aquí).
CREATE POLICY policy_vacunas_vet ON vacunas_aplicadas 
FOR ALL 
TO rol_veterinario 
USING (
    EXISTS (
        SELECT 1 FROM vet_atiende_mascota 
        WHERE vet_atiende_mascota.mascota_id = vacunas_aplicadas.mascota_id 
        AND vet_atiende_mascota.vet_id = current_setting('app.current_vet_id', TRUE)::INT
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM vet_atiende_mascota 
        WHERE vet_atiende_mascota.mascota_id = vacunas_aplicadas.mascota_id 
        AND vet_atiende_mascota.vet_id = current_setting('app.current_vet_id', TRUE)::INT
    )
);

DROP POLICY IF EXISTS policy_vacunas_admin ON vacunas_aplicadas;
-- Permisiva para Administrador (quien no tiene by-pass por defecto o decide auditar).
CREATE POLICY policy_vacunas_admin ON vacunas_aplicadas 
FOR ALL 
TO rol_administrador 
USING (TRUE) 
WITH CHECK (TRUE);


-- =============================================================
-- 5. BLOQUE DE VERIFICACIÓN
-- =============================================================
DO $$ 
DECLARE
    v_mascotas INT;
    v_citas INT;
    v_vacunas INT;
BEGIN
    SELECT COUNT(*) INTO v_mascotas FROM pg_policies WHERE tablename = 'mascotas';
    SELECT COUNT(*) INTO v_citas FROM pg_policies WHERE tablename = 'citas';
    SELECT COUNT(*) INTO v_vacunas FROM pg_policies WHERE tablename = 'vacunas_aplicadas';

    RAISE NOTICE '=================================================';
    RAISE NOTICE '✔️ POLÍTICAS RLS APLICADAS CORRECTAMENTE';
    RAISE NOTICE '-------------------------------------------------';
    RAISE NOTICE 'Políticas activas en MASCOTAS: %', v_mascotas;
    RAISE NOTICE 'Políticas activas en CITAS: %', v_citas;
    RAISE NOTICE 'Políticas activas en VACUNAS_APLICADAS: %', v_vacunas;
    RAISE NOTICE '=================================================';
END $$;