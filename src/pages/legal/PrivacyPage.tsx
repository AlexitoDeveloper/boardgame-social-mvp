import { LegalLayout } from './LegalLayout'
import { useAuth } from '../../lib/authContext'

export function PrivacyPage() {
  const { language } = useAuth()
  const isEs = language === 'es'

  return (
    <LegalLayout
      title={isEs ? 'Política de Privacidad' : 'Privacy Policy'}
      subtitle={
        isEs
          ? 'En Ludiclub nos tomamos muy en serio la privacidad y protección de tus datos personales.'
          : 'At Ludiclub we take the privacy and protection of your personal data very seriously.'
      }
      lastUpdated="2026-09-23"
    >
      {isEs ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Responsable del Tratamiento</h2>
            <p>
              La aplicación <strong>Ludiclub</strong> (en adelante, &quot;la Aplicación&quot;) es una plataforma diseñada para que grupos lúdicos y aficionados a los juegos de mesa organicen partidas, gestionen colecciones y compartan su pasión. Para cualquier consulta sobre privacidad, puedes contactarnos en: <span className="font-mono text-primary">support@ludiclub.app</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Datos que Recopilamos</h2>
            <p>Para prestar los servicios de la plataforma, recopilamos la siguiente información:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Datos de cuenta:</strong> Correo electrónico y nombre de usuario / alias para autenticación y perfil público.</li>
              <li><strong>Contenido generado por el usuario (UGC):</strong> Fotos de perfil, descripciones de partidas, mensajes enviados en los chats de mesa/grupo, listas de colección y rankings/tops.</li>
              <li><strong>Ubicación de partidas:</strong> Direcciones o referencias de lugares introducidas manualmente por los organizadores (no rastreamos geolocalización GPS en segundo plano).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Finalidad y Base Jurídica</h2>
            <p>Tratamos tus datos exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Permitir el registro, inicio de sesión y gestión segura de tu cuenta.</li>
              <li>Facilitar la organización de partidas, mesas lúdicas y comunicación en chats grupales.</li>
              <li>Mantener la seguridad, moderar reportes de conducta inapropiada y prevenir fraudes o abusos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Proveedores y Terceros Subencargados</h2>
            <p>
              No vendemos ni comercializamos tus datos personales a empresas de publicidad. Para el funcionamiento técnico utilizamos:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Supabase Inc.:</strong> Base de datos PostgreSQL en la nube, autenticación cifrada y almacenamiento de archivos.</li>
              <li><strong>BoardGameGeek (BGG):</strong> Consulta de metadatos y portadas públicas de juegos de mesa.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Tus Derechos (RGPD y Protección de Datos)</h2>
            <p>Tienes derecho en cualquier momento a:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Acceder a los datos que conservamos sobre ti.</li>
              <li>Rectificar información inexacta o desactualizada desde tu perfil.</li>
              <li><strong>Eliminar tu cuenta y todos tus datos personales asociados:</strong> Puedes realizarlo directamente dentro de la aplicación (Ajustes de Perfil → Eliminar Cuenta) o a través de nuestra página web pública de solicitud de baja en <a href="/delete-account" className="text-primary underline">ludiclub.app/delete-account</a>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Seguridad de la Información</h2>
            <p>
              Toda la comunicación entre tu dispositivo y nuestros servidores se realiza mediante cifrado TLS/HTTPS. Las contraseñas se almacenan mediante funciones de hash criptográfico unidireccionales y las tablas de base de datos están protegidas por políticas estrictas de seguridad a nivel de fila (Row Level Security).
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Data Controller</h2>
            <p>
              The <strong>Ludiclub</strong> app is a platform created for tabletop enthusiasts and gaming groups to organize game nights, manage collections, and vote on what to play. For privacy inquiries, please contact: <span className="font-mono text-primary">support@ludiclub.app</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Account information:</strong> Email address and username/display name.</li>
              <li><strong>User-generated content (UGC):</strong> Avatars, meetup descriptions, in-app chat messages, game collections, and tier lists.</li>
              <li><strong>Meetup locations:</strong> Physical addresses or venue names manually entered by hosts (no continuous background GPS tracking).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Purpose of Processing</h2>
            <p>We process your data strictly to provide app functionality, manage user accounts, coordinate tabletop sessions, and ensure safety and moderation across communities.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Third-Party Sub-processors</h2>
            <p>We never sell your personal data. We utilize trusted infrastructure providers:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Supabase Inc.:</strong> Managed PostgreSQL database, authentication, and file storage.</li>
              <li><strong>BoardGameGeek (BGG):</strong> Public catalog querying for board game metadata and artwork.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Your Rights & Account Deletion</h2>
            <p>
              You have the right to access, rectify, export, or permanently delete your account and associated personal records at any time. You can trigger immediate account deletion directly in the app (Profile Settings → Delete Account) or online at <a href="/delete-account" className="text-primary underline">ludiclub.app/delete-account</a>.
            </p>
          </section>
        </>
      )}
    </LegalLayout>
  )
}
