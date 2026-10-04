# Diseño del Esquema de Base de Datos — Fase 1 (Core & Auth)

## 1. Entidades Principales

### `tenants`
Representa una organización o comercio independiente en la plataforma.
- `id`: UUID (Primary Key, autogenerado con `gen_random_uuid()`).
- `name`: TEXT (Nombre comercial del inquilino).
- `slug`: TEXT (Identificador único para subdominios y rutas, índice único).
- `status`: TEXT ('ACTIVE' | 'SUSPENDED' | 'ARCHIVED').
- `created_at`: TIMESTAMPTZ.
- `updated_at`: TIMESTAMPTZ.

### `users`
Almacena las credenciales y perfiles de los usuarios de la plataforma.
- `id`: UUID (Primary Key).
- `email`: TEXT (Índice único, normalizado en minúsculas).
- `name`: TEXT.
- `password_hash`: TEXT (Hash Bcrypt de 12 rondas).
- `status`: TEXT ('ACTIVE' | 'INACTIVE' | 'BANNED').
- `created_at`: TIMESTAMPTZ.
- `updated_at`: TIMESTAMPTZ.

### `tenant_memberships`
Entidad asociativa que vincula usuarios con organizaciones y define sus roles RBAC.
- `id`: UUID (Primary Key).
- `tenant_id`: UUID (Foreign Key -> `tenants.id`, ON DELETE CASCADE).
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE).
- `role`: TEXT ('owner' | 'admin' | 'manager' | 'staff').
- `status`: TEXT ('ACTIVE' | 'INVITED' | 'SUSPENDED').
- `created_at`: TIMESTAMPTZ.
- `updated_at`: TIMESTAMPTZ.
- **Restricción de unicidad:** `UNIQUE (tenant_id, user_id)`.
- **Protección RLS:** `FORCE ROW LEVEL SECURITY` activo.

### `sessions`
Gestiona el estado de autenticación y el tenant activo de cada sesión.
- `id`: UUID (Primary Key).
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE).
- `active_tenant_id`: UUID (Foreign Key -> `tenants.id`, ON DELETE SET NULL).
- `token_hash`: TEXT (Índice único, hash SHA-256 del token crudo).
- `expires_at`: TIMESTAMPTZ.
- `created_at`: TIMESTAMPTZ.
- `last_active_at`: TIMESTAMPTZ.

### `tenant_audit_logs`
Pista de auditoría inmutable de eventos sensibles por tenant.
- `id`: UUID (Primary Key).
- `tenant_id`: UUID (Foreign Key -> `tenants.id`, ON DELETE CASCADE).
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE SET NULL).
- `action`: TEXT.
- `entity`: TEXT.
- `entity_id`: TEXT.
- `details`: JSONB.
- `ip_address`: TEXT.
- `user_agent`: TEXT.
- `created_at`: TIMESTAMPTZ.
- **Protección RLS:** `FORCE ROW LEVEL SECURITY` activo.
