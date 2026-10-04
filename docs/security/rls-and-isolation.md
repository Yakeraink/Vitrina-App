# Aislamiento de Datos mediante PostgreSQL Row-Level Security (RLS)

## 1. Por qué RLS en el Motor de Base de Datos
En aplicaciones multi-tenant tradicionales, el aislamiento depende exclusivamente de que los desarrolladores recuerden incluir `WHERE tenant_id = ?` en cada consulta. Un solo desarrollador que olvide este filtro genera una fuga catastrófica de datos (IDOR o Cross-Tenant Data Leak).

Para eliminar este riesgo a nivel de infraestructura, se implementa **PostgreSQL Row-Level Security (RLS)** directamente en la base de datos.

## 2. Definición de Políticas RLS
En cada tabla que almacena datos de dominio (comenzando por `tenant_memberships` y `tenant_audit_logs` en la Fase 1):

```sql
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_memberships ON tenant_memberships
  FOR ALL
  TO public, app_user
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );
```

### Reglas Críticas de Evaluación:
1. `current_setting('app.current_tenant_id', true)`: El segundo argumento `true` evita que PostgreSQL falle si la variable aún no está configurada, retornando `NULL` o cadena vacía.
2. `NULLIF(..., '')::uuid`: Convierte valores vacíos a `NULL`.
3. Al evaluar `tenant_id = NULL`, en lógica trivalente SQL el resultado es `FALSE`.
4. **Resultado:** Si una consulta se ejecuta sin un contexto de tenant explícito, la base de datos devuelve **cero filas** y bloquea cualquier inserción/actualización.

## 3. Manejo del Connection Pool y Prevención de Contaminación
En aplicaciones Node.js que utilizan connection pooling (como `postgres` o `pg`), las conexiones físicas se reutilizan entre diferentes solicitudes HTTP. Si un request altera una variable de sesión con `SET app.current_tenant_id = '...'` y la conexión regresa al pool, la siguiente solicitud de otro cliente podría heredar dicho contexto.

### Mitigación Quirúrgica Implementada:
1. **Transacciones Aisladas:** Todas las operaciones con contexto de tenant se ejecutan dentro de `withTenantContext(tenantId, callback)` utilizando `db.transaction()`.
2. **Uso de `SET LOCAL`:**
   ```sql
   SET LOCAL ROLE app_user;
   SET LOCAL app.current_tenant_id = '<tenant_id>';
   ```
   En PostgreSQL, el modificador `LOCAL` restringe la variable **exclusivamente a la transacción actual**. Al ejecutarse `COMMIT` o `ROLLBACK`, PostgreSQL revierte automáticamente el valor a su estado previo.
3. **Rol No-Superusuario (`app_user`):**
   Los superusuarios de PostgreSQL (como `postgres`) ignoran las políticas RLS por diseño interno del motor. Para garantizar el cumplimiento estricto de las políticas RLS, la transacción adopta el rol `app_user` (`NOSUPERUSER NOBYPASSRLS`).
4. **Defensa en Profundidad:** Al finalizar la transacción (en el bloque `finally`), el wrapper ejecuta explícitamente:
   ```sql
   RESET app.current_tenant_id;
   RESET ROLE;
   ```
