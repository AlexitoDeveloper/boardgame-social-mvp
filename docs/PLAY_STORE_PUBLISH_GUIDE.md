# Guía Definitiva de Publicación en Google Play Store: Ludiclub

Esta guía contiene todos los pasos técnicos, legales y operativos para publicar **Ludiclub** (`com.ludiclub.app`) en Google Play Console con aprobación garantizada en las revisiones de Google.

---

## 1. Generación de Keystore y Compilación del Release AAB

Google Play requiere paquetes en formato **Android App Bundle (.aab)** firmados digitalmente con una clave de carga (*upload key*).

### Paso 1.1: Generar el archivo Keystore (Clave de Firma)
Abre PowerShell o terminal en la raíz de tu proyecto o en tu carpeta segura y ejecuta:

```powershell
keytool -genkey -v -keystore ludiclub-release.jks -alias ludiclub -keyalg RSA -keysize 2048 -validity 10000
```
*(Guarda la contraseña y el archivo `ludiclub-release.jks` en un lugar seguro. Si pierdes este archivo o la contraseña antes de activar Google Play App Signing, no podrás actualizar la app).*

### Paso 1.2: Compilar el Bundle de Producción (.aab)
En la carpeta `android/`:
```powershell
# Sincronizar los cambios web más recientes
node node_modules/@capacitor/cli/bin/capacitor sync android

# Compilar el bundle AAB
cd android
./gradlew bundleRelease
```
El archivo compilado se generará en:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 2. Configuración de la Ficha en Google Play Console

### Identidad de la Aplicación
* **Nombre de la app (máx. 30 caracteres):** `Ludiclub: Tu Grupo de Juegos` *(o `Ludiclub: Juegos de Mesa`)*
* **Descripción breve (máx. 80 caracteres):** `Organiza partidas, vota qué jugar, descubre novedades y gestiona tu grupo lúdico.`
* **Categoría:** Ocio y entretenimiento / Redes sociales / Estilo de vida.
* **Correo de soporte:** Tu correo de contacto (ej: `support@ludiclub.app` o tu email personal/profesional).

### Recursos Gráficos Obligatorios
1. **Icono de la aplicación:** 512 × 512 px (PNG de 32 bits con canal alfa).
2. **Gráfico de funciones (Banner destacado):** 1024 × 500 px (JPG o PNG de 24 bits sin transparencia).
3. **Capturas de pantalla del teléfono:**
   * Mínimo 2 capturas (recomendado 4 a 6 capturas de alta calidad).
   * Relación de aspecto 16:9 o 9:16 (ej: 1080 × 1920 px o 1080 × 2400 px).
   * *Sugerencia de pantallas:* Vista de Explorar juegos, Detalle de una Mesa de juego, Selector interactivo de mesa (Table Tools), y Chat/Grupo.

---

## 3. Cumplimiento de Políticas y Cuestionarios Obligatorios

En el menú lateral de Play Console, dentro de **Contenido de la aplicación**:

### A. Política de Privacidad (Obligatorio)
* URL de la política: `https://[TU-DOMINIO]/privacy`
*(La página ya está creada en `src/pages/legal/PrivacyPage.tsx`).*

### B. Eliminación de Cuentas y Datos (Mandato Google Play)
* ¿Tu aplicación permite a los usuarios crear una cuenta? **Sí**.
* ¿Los usuarios pueden eliminar su cuenta dentro de la app? **Sí** *(en Perfil → Ajustes → Eliminar mi cuenta)*.
* **Enlace web para solicitar la eliminación de datos:** `https://[TU-DOMINIO]/delete-account`
*(La página ya está creada en `src/pages/legal/AccountDeletionPage.tsx`).*
* ¿Se eliminan todos los datos o se conservan algunos? **Se eliminan todos los datos de usuario y autenticación**.

### C. Seguridad de los Datos (Data Safety Questionnaire)
Responde exactamente lo siguiente según nuestra arquitectura Supabase:
1. **¿Tu aplicación recopila o comparte alguno de los tipos de datos de usuario requeridos?**
   * Selecciona: **Sí**.
2. **¿Se cifran en tránsito todos los datos de usuario recopilados por tu aplicación?**
   * Selecciona: **Sí** (utilizamos HTTPS / TLS con Supabase).
3. **¿Proporcionas a los usuarios una forma de solicitar que se eliminen sus datos?**
   * Selecciona: **Sí**.
4. **Datos específicos recopilados:**
   * **Información personal:**
     * *Dirección de correo electrónico* (Recopilada para la funcionalidad de la app y administración de cuentas. No se comparte con terceros).
     * *Nombre / Alias de usuario* (Funcionalidad de la app y personalización).
   * **Fotos y vídeos:**
     * *Fotos* (Opcional, para el avatar de perfil. Funcionalidad de la app).
   * **Mensajes:**
     * *Otros mensajes en la aplicación* (Mensajes del chat de mesa entre jugadores. Funcionalidad de la app).
5. **¿Se comparten datos con fines publicitarios o con redes de anuncios?**
   * Selecciona: **No**.

### D. Acceso a la Aplicación (Para los Revisores de Google)
Dado que hay pantallas protegidas por contraseña:
* Selecciona: **Algunas funciones están restringidas**.
* Proporciona un usuario y contraseña de prueba precreados en tu Supabase:
  * *Instrucciones:* "Inicia sesión con las credenciales de prueba para explorar partidas abiertas, chat y grupos."
  * *Usuario:* `demo@ludiclub.app` (o el que configures)
  * *Contraseña:* `Ludiclub2026!`

### E. Clasificación del Contenido (IARC)
* Cuestionario para aplicaciones sociales/utilitarias.
* ¿Contiene contenido sexual, apuestas o violencia? **No**.
* ¿Permite a los usuarios interactuar o intercambiar mensajes? **Sí**.
* ¿Comparte la ubicación física exacta del usuario en tiempo real mediante GPS? **No** (las ubicaciones de mesas son direcciones introducidas manualmente en texto).

### F. Público Objetivo y Contenido
* Selecciona mayores de edad o mayores de 13 años (ej: **18 años o más** o **13 a 17 años**).
* *Recomendación:* No marques menores de 13 años para evitar las regulaciones extremadamente estrictas del programa Familias de Google.

---

## 4. Requisito Clave: Los 20 Evaluadores durante 14 Días

Si tu cuenta de Google Play Developer es personal (creada después del 13 de noviembre de 2023), Google exige:
1. Subir tu archivo `.aab` a la sección **Prueba cerrada (Closed Testing)**.
2. Añadir al menos **20 evaluadores** (amigos, jugadores de tu comunidad o listas de correo) mediante una lista de Google Groups o correos electrónicos.
3. Los 20 evaluadores deben aceptar la invitación y mantener la app instalada durante **al menos 14 días consecutivos**.
4. Pasados los 14 días, se desbloqueará el botón **Solicitar acceso a producción** en la consola de Google Play.

---

## 5. Resumen de Archivos Implementados en el Código

| Archivo / Ruta | Propósito |
| :--- | :--- |
| `capacitor.config.ts` | Configura `appId: 'com.ludiclub.app'` y `appName: 'Ludiclub'` |
| `android/app/build.gradle` | Namespace `com.ludiclub.app` y bloque de firmas para release |
| `android/.../MainActivity.java` | Paquete oficial `com.ludiclub.app` |
| `src/pages/legal/PrivacyPage.tsx` | Política de Privacidad bilingüe (`/privacy`) |
| `src/pages/legal/TermsPage.tsx` | Términos de Servicio y normas de convivencia UGC (`/terms`) |
| `src/pages/legal/AccountDeletionPage.tsx` | Formulario público de solicitud de baja (`/delete-account`) |
| `supabase/delete_user_account.sql` | Función RPC segura para eliminar cuenta en Supabase |
| `supabase/ugc_safety_and_reports.sql` | Tablas de reportes y bloqueo de usuarios para UGC |
| `src/hooks/useDeleteAccount.ts` | Hook de eliminación y limpieza de sesión |
| `src/hooks/useUgcSafety.ts` | Hook de reporte de conductas inapropiadas y bloqueos |
| `src/components/common/ReportContentDialog.tsx` | Diálogo Radix UI para reportar contenido o usuarios |
| `src/components/profile/DeleteAccountDialog.tsx` | Diálogo Radix UI con doble confirmación para borrar cuenta |
