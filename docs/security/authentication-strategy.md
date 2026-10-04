# Estrategia de Autenticación y Gestión de Sesiones

## 1. Solución Seleccionada
**Motor de Sesiones Criptográficas Basado en Base de Datos con Tokens SHA-256 (Arquitectura Limpia con Drizzle ORM + PostgreSQL).**

## 2. Justificación Técnica de la Elección
- **Por qué no NextAuth v4/v5 (Auth.js):**
  El proveedor de credenciales (email/password) en Auth.js no soporta de forma nativa sesiones almacenadas en base de datos sin recurrir a tokens JWT firmados en el cliente. Esto dificulta la revocación inmediata de sesiones, el cambio dinámico de inquilinos multi-tenant y la inyección transparente de contexto RLS en PostgreSQL.
- **Por qué no librerías obsoletas (como Lucia v3):**
  Lucia v3 fue descontinuada y archivada a inicios de 2024. Su autor recomendó desacoplar la gestión de sesiones y construir implementaciones directas y transparentes.
- **Ventajas del Motor Propietario Diseñado:**
  1. **Control Total del Ciclo de Vida:** Cero dependencias externas opacas que sufran cambios drásticos de API en versiones futuras.
  2. **Revocación Instantánea:** Una sesión puede eliminarse en la base de datos inmediatamente (e.g. cierre de sesión en todos los dispositivos o cambio de credenciales).
  3. **Multi-Tenancy de Primera Clase:** La entidad `sessions` tiene una relación directa con `users` y un puntero mutable `active_tenant_id` validado contra `tenant_memberships`.

## 3. Seguridad de Contraseñas
- Algoritmo: **Bcrypt** con factor de coste de **12 rondas de sal**.
- Sal aleatoria criptográfica generada por cada usuario.

## 4. Almacenamiento y Criptografía de Tokens
1. **Generación:** Al iniciar sesión, se generan 32 bytes (256 bits) de entropía aleatoria mediante `crypto.randomBytes(32)` en formato hexadecimal.
2. **Almacenamiento en Cliente:** Se envía al navegador mediante una cookie con flags estrictas:
   - `HttpOnly`: Impide acceso desde JavaScript en el navegador (protección total contra robo vía XSS).
   - `Secure`: Solo se transmite por HTTPS en producción.
   - `SameSite=Lax`: Mitiga ataques CSRF.
   - `Path=/`: Disponible en toda la aplicación.
3. **Almacenamiento en Servidor:**
   - La base de datos **NUNCA** almacena el token en texto plano.
   - Se almacena exclusivamente el hash SHA-256 (`crypto.createHash('sha256').update(rawToken).digest('hex')`).
   - Si la base de datos sufriera una filtración externa (*dump*), los atacantes no pueden utilizar los hashes para autenticarse como los usuarios.
