-- Definición de roles y privilegios
-- =============================================================
-- 04. ROLES Y PERMISOS · CORTE 3
-- =============================================================

-- 1 y 2. Creación de Roles y Usuarios de forma idempotente
DO $$
BEGIN
    -- Crear roles si no existen
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_veterinario') THEN
        CREATE ROLE rol_veterinario;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_recepcion') THEN
        CREATE ROLE rol_recepcion;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_administrador') THEN
        CREATE ROLE rol_administrador;
    END IF;

    -- Crear usuarios con contraseña si no existen
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vet_lopez') THEN
        CREATE USER vet_lopez WITH PASSWORD 'vet123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'recepcion_ana') THEN
        CREATE USER recepcion_ana WITH PASSWORD 'rec123';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_isaac') THEN
        CREATE USER admin_isaac WITH PASSWORD 'adm123';
    END IF;
END
$$;

-- 3. Asignación de Usuarios a sus respectivos Roles
GRANT rol_veterinario TO vet_lopez;
GRANT rol_recepcion TO recepcion_ana;
GRANT rol_administrador TO admin_isaac;

-- Otorgar uso de secuencias para que los INSERT con campos SERIAL funcionen
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_veterinario;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_recepcion;

-- =============================================================
-- 4. PERMISOS ESPECÍFICOS POR TABLA (GRANT / REVOKE)
-- =============================================================

-- ROL: VETERINARIO
GRANT SELECT, INSERT ON citas TO rol_veterinario;
GRANT SELECT, INSERT ON vacunas_aplicadas TO rol_veterinario;
GRANT SELECT ON mascotas TO rol_veterinario;
GRANT SELECT ON vet_atiende_mascota TO rol_veterinario;
GRANT SELECT ON inventario_vacunas TO rol_veterinario;

REVOKE ALL ON duenos FROM rol_veterinario;
REVOKE ALL ON historial_movimientos FROM rol_veterinario;
REVOKE ALL ON alertas FROM rol_veterinario;

-- ROL: RECEPCIÓN
GRANT SELECT ON mascotas TO rol_recepcion;
GRANT SELECT ON duenos TO rol_recepcion;
GRANT SELECT, INSERT ON citas TO rol_recepcion;

REVOKE ALL ON vacunas_aplicadas FROM rol_recepcion;
REVOKE ALL ON inventario_vacunas FROM rol_recepcion;
REVOKE ALL ON historial_movimientos FROM rol_recepcion;
REVOKE ALL ON alertas FROM rol_recepcion;

-- ROL: ADMINISTRADOR
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_administrador;
ALTER ROLE rol_administrador BYPASSRLS;

-- =============================================================
-- 5. PERMISOS DE EJECUCIÓN SOBRE PROCEDIMIENTOS, FUNCIONES Y VISTAS
-- =============================================================

-- sp_agendar_cita (Veterinario y Recepción)
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT) TO rol_veterinario;
GRANT EXECUTE ON PROCEDURE sp_agendar_cita(INT, INT, TIMESTAMP, TEXT) TO rol_recepcion;

-- fn_total_facturado (Solo Administrador)
GRANT EXECUTE ON FUNCTION fn_total_facturado(INT, INT) TO rol_administrador;
REVOKE EXECUTE ON FUNCTION fn_total_facturado(INT, INT) FROM public;

-- v_mascotas_vacunacion_pendiente (Todos pueden ver la vista, la info filtrada depende del RLS subyacente)
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO rol_veterinario;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO rol_recepcion;
GRANT SELECT ON v_mascotas_vacunacion_pendiente TO rol_administrador;

