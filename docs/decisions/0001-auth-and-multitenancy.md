# Registro de Decisión Arquitectónica (ADR 0001)

## Título: Selección del Sistema de Autenticación y Estrategia Multi-Tenant con RLS

### Estado: Aceptado
### Fecha: 2026-10-04

### Contexto
La plataforma requiere soportar múltiples comercios (tenants) independientes bajo un mismo backend, garantizando que un usuario del Tenant A jamás pueda acceder, visualizar o alterar datos del Tenant B (protección contra IDOR y fugas entre organizaciones). Asimismo, se requiere un mecanismo de autenticación confiable, localmente reproducible y desacoplado de proveedores externos para el desarrollo.

### Alternativas Evaluadas
1. **NextAuth v4 / Auth.js v5 con JWTs en Cliente:**
   - *Desventajas:* Dificultad para revocar sesiones inmediatamente en base de datos. Poca flexibilidad para alternar el `activeTenantId` de una sesión activa sin forzar re-logins o firmas complejas de tokens en el cliente.
2. **Lucia Auth v3:**
   - *Desventajas:* Proyecto discontinuado y archivado por su autor original.
3. **Database-per-Tenant:**
   - *Desventajas:* Costo de infraestructura y complejidad de despliegue prohibitivos con cientos de tiendas.
4. **Motor de Sesiones Criptográficas Propietario en Drizzle + Shared Database con PostgreSQL RLS:**
   - *Ventajas:* Control absoluto de seguridad. Tokens con SHA-256 en base de datos y cookies HttpOnly. Aislamiento forzoso en PostgreSQL (`FORCE ROW LEVEL SECURITY`) que impide filtraciones de datos incluso si se omitiera un filtro en código TypeScript.

### Decisión
Se implementa el **Motor de Sesiones Criptográficas en Base de Datos** junto con **PostgreSQL Row-Level Security (RLS)** y un rol no-superusuario (`app_user`). Cada operación de base de datos dentro del contexto de un tenant se envuelve en una transacción con `SET LOCAL ROLE app_user; SET LOCAL app.current_tenant_id = '<tenant_id>';`.

### Consecuencias
- **Positivas:** Seguridad de grado empresarial, mitigación total de IDOR en base de datos, código limpio y mantenible sin dependencias externas opacas, cobertura de pruebas unitarias y de integración al 100%.
- **Negativas / Compromisos:** Requiere que todas las transacciones de negocio sensibles se ejecuten mediante la función `withTenantContext`, lo cual está encapsulado en los servicios de dominio.
