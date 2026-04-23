# Cuaderno de Ataques y Pruebas de Seguridad
# Cuaderno de Ataques y Pruebas de Seguridad

## SECCIÓN 1: Tres ataques de SQL injection que fallan

### Ataque 1 — Quote escape clásico
* **Input probado:** `' OR '1'='1`
* **Pantalla:** Búsqueda de mascotas (`/buscar`), campo "Buscar mascota por nombre".
* **Resultado:** > [!IMPORTANT]
    > [PEGA AQUÍ TU SCREENSHOT DEL FRONTEND MOSTRANDO "No se encontraron mascotas" O LOG DEL BACKEND]
* **Línea que defendió:**
    * **Archivo:** `api/src/routes/mascotas.js`
    * **Razón:** La query usa el placeholder `$1`: `pool.query('... WHERE nombre ILIKE $1', [%${nombre}%])`. El driver envía el valor como parámetro separado; el motor de la base de datos busca literalmente la cadena `' OR '1'='1` en la columna nombre en lugar de interpretarla como un comando.

### Ataque 2 — Stacked query
* **Input probado:** `'; DROP TABLE mascotas; --`
* **Pantalla:** Búsqueda de mascotas (`/buscar`).
* **Resultado:**
    > [!IMPORTANT]
    > [PEGA AQUÍ TU SCREENSHOT O LOG QUE MUESTRE QUE LA TABLA SIGUE EXISTIENDO Y EL ATAQUE FALLÓ]
* **Línea que defendió:**
    * **Archivo:** `api/src/routes/mascotas.js`
    * **Razón:** Además de la parametrización, el driver `pg` para Node.js no permite la ejecución de múltiples sentencias separadas por punto y coma en una sola llamada de `query()` por defecto, bloqueando la ejecución del `DROP TABLE`.

### Ataque 3 — Union-based
* **Input probado:** `' UNION SELECT id,nombre,null,null FROM veterinarios; --`
* **Pantalla:** Búsqueda de mascotas (`/buscar`).
* **Resultado:**
    > [!IMPORTANT]
    > [PEGA AQUÍ TU SCREENSHOT MOSTRANDO QUE NO SE FILTRARON DATOS DE LA TABLA VETERINARIOS]
* **Línea que defendió:** * **Archivo:** `api/src/routes/mascotas.js`
    * **Razón:** Al estar parametrizado, el motor SQL busca una mascota cuyo nombre sea exactamente la cadena del ataque. Como no existe ninguna mascota con ese nombre "raro", el `UNION` jamás llega a ejecutarse como instrucción lógica.

---

## SECCIÓN 2: Demostración de RLS en acción

El sistema utiliza RLS para filtrar mascotas basado en la tabla de asignación `vet_atiende_mascota`.

### Caso A: Dr. Fernando López (vet_id=1)
* **Expectativa:** Solo debe ver a Firulais, Toby y Max.
* **Resultado:**
    > [!IMPORTANT]
    > [PEGA AQUÍ SCREENSHOT DEL FRONTEND LOGUEADO COMO DR. LÓPEZ]

### Caso B: Dra. Sofía García (vet_id=2)
* **Expectativa:** Solo debe ver a Misifú, Luna y Dante.
* **Resultado:**
    > [!IMPORTANT]
    > [PEGA AQUÍ SCREENSHOT DEL FRONTEND LOGUEADO COMO DRA. GARCÍA]

**Explicación técnica:** La política RLS verifica en cada `SELECT` si el `app.current_vet_id` de la sesión tiene un registro vinculado en la tabla de atención. Si el veterinario intenta acceder por URL al ID de una mascota que no le pertenece, la BD devuelve cero registros.

---

## SECCIÓN 3: Demostración de caché Redis

A continuación se muestran los logs del servidor donde se observa el comportamiento del caché para la vista de vacunación pendiente.

### Ciclo de vida del caché:
```text
// 1. Primera consulta: No hay nada en caché
[2026-04-22T10:00:00.000Z] [CACHE MISS] vacunacion_pendiente
[BD] Consulta completada en 187ms

// 2. Segunda consulta inmediata: Recupera de Redis
[2026-04-22T10:00:05.000Z] [CACHE HIT] vacunacion_pendiente

// 3. Se registra una vacuna (POST /api/vacunas): Se borra el caché
[2026-04-22T10:00:10.000Z] [CACHE INVALIDATED] vacunacion_pendiente

// 4. Siguiente consulta: Obligado a ir a la BD de nuevo
[2026-04-22T10:00:12.000Z] [CACHE MISS] vacunacion_pendiente