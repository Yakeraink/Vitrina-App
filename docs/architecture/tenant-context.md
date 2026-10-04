# Arquitectura de Tenant Context

## 1. Principio Fundamental
El sistema opera bajo el principio de **confianza cero hacia el cliente** (*Zero Trust Client Input*). El frontend nunca puede dictar directamente qué `tenantId` tiene derecho a consultar o mutar.

## 2. Derivación del Contexto

### Contexto Autenticado (Panel de Control y APIs Privadas)
1. El usuario envía su solicitud con la cookie criptográfica HttpOnly `tv_session_token`.
2. El servidor valida la sesión en la base de datos contra el hash SHA-256 (`sessions.token_hash`).
3. Se recupera el `active_tenant_id` asociado a la sesión.
4. El servidor valida que el usuario mantenga una membresía activa (`tenant_memberships`) en dicho tenant.
5. El contexto se inyecta en el flujo de ejecución server-side mediante el helper `requireTenantContext()`.

### Contexto Público (Storefront / Tienda Pública)
1. El Edge Middleware (`src/middleware.ts`) intercepta el header `Host`.
2. Si el host es un subdominio (e.g., `acme.plataforma.com`) o un dominio personalizado (e.g., `www.tiendaacme.com`), se normaliza y se resuelve el `slug` del tenant.
3. Se inyecta en las cabeceras internas de la solicitud (`x-tenant-slug`).
4. La vista pública solo carga catálogos con estado activo asociados al tenant correspondiente.

## 3. Protección contra IDOR (Insecure Direct Object References)
- Si un usuario autenticado en el Tenant A envía una solicitud con un payload alterado que incluye `tenantId: "uuid-del-tenant-b"`, el backend ignora dicho valor y utiliza exclusivamente el `tenantId` verificado del contexto de la sesión.
- Cualquier intento explícito de cambiar el tenant activo (`AuthService.switchTenant`) verifica previamente que exista una membresía activa del usuario en el tenant destino. En caso contrario, se arroja un error `Forbidden (403)`.
