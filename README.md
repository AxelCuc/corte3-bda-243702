# Sistema de Clínica Veterinaria - Corte 3
# Clínica Veterinaria — Sistema Full-Stack con Seguridad de BD

Este sistema es una solución integral para la gestión de una clínica veterinaria, diseñada con un enfoque primordial en la seguridad de los datos a nivel de base de Datos. El sistema permite gestionar mascotas, citas y esquemas de vacunación, diferenciando estrictamente el acceso a la información según el rol del usuario mediante políticas avanzadas de PostgreSQL.

### Stack Técnico
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-red?logo=redis)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-Backend-lightgrey?logo=express)
![Next.js](https://img.shields.io/badge/Next.js-AppRouter-black?logo=nextdotjs)
![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)

### Características de Seguridad Implementadas
* **Control de Acceso Basado en Roles (RBAC):** Roles específicos para Veterinario, Recepción y Administrador con permisos granulares (GRANT/REVOKE).
* **Seguridad a Nivel de Fila (RLS):** Los veterinarios solo pueden visualizar y gestionar las mascotas que tienen asignadas.
* **Defensa contra SQL Injection:** Uso sistemático de consultas parametrizadas en toda la capa de persistencia.
* **Gestión Segura de Sesiones:** Comunicación de identidad del usuario a la BD mediante variables de configuración de sesión (`app.current_vet_id`).
* **Capa de Caché Segura:** Implementación de Redis para optimizar consultas frecuentes con estrategias de invalidación controlada.

### Instrucciones para levantar el proyecto
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/corte3-bda-veterinaria.git](https://github.com/tu-usuario/corte3-bda-veterinaria.git)
    cd corte3-bda-veterinaria
    ```
2.  **Configurar variables de entorno:**
    ```bash
    cp .env.example .env
    # Editar .env con tus credenciales de BD y Redis
    ```
3.  **Levantar con Docker:**
    ```bash
    docker-compose up --build
    ```
4.  **Acceder a la aplicación:**
    Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## SECCIÓN B — Decisiones de diseño

**1. ¿Qué política RLS aplicaste a la tabla mascotas?**
Se aplicó la siguiente cláusula: `USING (EXISTS (SELECT 1 FROM vet_atiende_mascota vam WHERE vam.mascota_id = mascotas.id AND vam.vet_id = current_setting('app.current_vet_id')::int))`. Esta política asegura que un veterinario solo vea los registros de la tabla `mascotas` si existe una relación activa en la tabla intermedia que lo vincule con dicho animal.

**2. ¿Cuál es el vector de ataque posible al identificar al veterinario en RLS y cómo se mitiga?**
El vector de ataque es la suplantación de identidad mediante la manipulación de headers, donde un usuario malicioso podría enviar un `X-Vet-Id` falso para ver datos ajenos. El sistema lo mitiga realizando la validación en el backend (vía middleware de autenticación) antes de ejecutar `SET app.current_vet_id`, asegurando que el ID provenga de una sesión verificada y no del input directo del cliente.

**3. Justificación sobre el uso de SECURITY DEFINER en procedures.**
No se utilizó `SECURITY DEFINER` en ningún procedimiento almacenado del sistema para adherirse al principio de menor privilegio. Al no usarlo, los procedimientos se ejecutan con los permisos del usuario que los invoca, evitando vulnerabilidades de escalada de privilegios donde un usuario con rol limitado podría ejecutar acciones de administrador.

**4. ¿Qué TTL le pusiste al caché Redis y por qué ese valor?**
Se configuró un TTL de 300 segundos (5 minutos) para la clave `vacunacion_pendiente`. Este valor es un equilibrio óptimo: si fuera demasiado bajo (ej. 10s), saturaríamos la base de datos con consultas repetitivas; si fuera demasiado alto (ej. 1 hora), los veterinarios verían datos desactualizados de mascotas que ya fueron vacunadas recientemente.

**5. Manejo de input del usuario antes de enviarlo a la BD.**
En el archivo `api/src/routes/mascotas.js`, se utiliza la siguiente línea para neutralizar ataques: 
`const res = await pool.query('SELECT * FROM mascotas WHERE nombre ILIKE $1', [%${nombre}%]);`. Aquí el driver `pg` se encarga de escapar cualquier carácter especial, tratando el contenido de la variable como un simple literal y no como código ejecutable.

**6. ¿Qué dejaría de funcionar si revocas todos los permisos del veterinario excepto SELECT en mascotas?**
Dejarían de funcionar tres operaciones críticas: 1) La visualización de citas programadas (tabla `citas`), 2) El registro de nuevas vacunas aplicadas (INSERT en `vacunas_aplicadas`), y 3) La consulta del historial de vacunación detallado de cada mascota.