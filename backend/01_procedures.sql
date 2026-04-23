-- Procedimientos almacenados
-- =============================================================
-- PROCEDIMIENTOS ALMACENADOS · CORTE 3
-- =============================================================

CREATE OR REPLACE PROCEDURE sp_agendar_cita(
    p_mascota_id     INT,
    p_veterinario_id INT,
    p_fecha_hora     TIMESTAMP,
    p_motivo         TEXT,
    OUT p_cita_id    INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_activo          BOOLEAN;
    v_dias_descanso   VARCHAR(50);
    v_dia_nombre      TEXT;
    v_descansa_array  TEXT[];
    v_existe_mascota  BOOLEAN;
BEGIN
    -- 1. Verificar existencia y estado del veterinario
    SELECT activo, COALESCE(dias_descanso, '') 
    INTO v_activo, v_dias_descanso
    FROM veterinarios 
    WHERE id = p_veterinario_id;

    IF NOT FOUND OR v_activo = FALSE THEN
        RAISE EXCEPTION 'Veterinario no encontrado o inactivo';
    END IF;

    -- 2. Verificar día de descanso
    -- TO_CHAR con template 'Day' devuelve el nombre completo en español (según LC_TIME)
    -- Se usa trim para quitar espacios y lower para normalizar
    v_dia_nombre := trim(lower(to_char(p_fecha_hora, 'Day')));
    v_descansa_array := string_to_array(v_dias_descanso, ',');

    IF v_dia_nombre = ANY(v_descansa_array) THEN
        RAISE EXCEPTION 'El veterinario no labora el día: %', v_dia_nombre;
    END IF;

    -- 3. Verificar existencia de la mascota
    SELECT EXISTS(SELECT 1 FROM mascotas WHERE id = p_mascota_id) INTO v_existe_mascota;
    
    IF NOT v_existe_mascota THEN
        RAISE EXCEPTION 'La mascota con ID % no existe', p_mascota_id;
    END IF;

    -- 4. Insertar cita
    INSERT INTO citas (mascota_id, veterinario_id, fecha_hora, motivo, estado)
    VALUES (p_mascota_id, p_veterinario_id, p_fecha_hora, p_motivo, 'AGENDADA')
    RETURNING id INTO p_cita_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Re-lanzar el error para que el backend lo capture
        RAISE;
END;
$$;