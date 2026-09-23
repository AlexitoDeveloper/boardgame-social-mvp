import { LegalLayout } from './LegalLayout'
import { useAuth } from '../../lib/authContext'

export function TermsPage() {
  const { language } = useAuth()
  const isEs = language === 'es'

  return (
    <LegalLayout
      title={isEs ? 'Términos de Servicio y Normas de la Comunidad' : 'Terms of Service & Community Rules'}
      subtitle={
        isEs
          ? 'Condiciones generales de uso, normas de convivencia y políticas de contenido para Ludiclub.'
          : 'General terms of use, community guidelines, and content policies for Ludiclub.'
      }
      lastUpdated="2026-09-23"
    >
      {isEs ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Aceptación de los Términos</h2>
            <p>
              Al registrarte o utilizar <strong>Ludiclub</strong>, aceptas estos Términos de Servicio y te comprometes a respetarlos. Si no estás de acuerdo con alguna cláusula, debes abstenerte de utilizar la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Tolerancia Cero con Contenido Abusivo y Normas de Conducta (UGC)</h2>
            <p>
              Ludiclub es un espacio dedicado a la convivencia lúdica sana y respetuosa. Mantenemos una <strong>política estricta de tolerancia cero</strong> frente a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Mensajes o imágenes con contenido violento, pornográfico, de odio, racista, sexista o discriminatorio.</li>
              <li>Acoso, amenazas, suplantación de identidad o difamación hacia otros miembros o anfitriones.</li>
              <li>Spam comercial, enlaces maliciosos o promociones no autorizadas en partidas o chats.</li>
            </ul>
            <p>
              Cualquier usuario que infrinja estas normas será suspendido o expulsado de manera definitiva sin previo aviso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Mecanismos de Reporte y Bloqueo</h2>
            <p>
              Cada usuario dispone de herramientas integradas para <strong>reportar</strong> contenido u organizadores infractores y <strong>bloquear</strong> perfiles molestos en chats, mesas y perfiles. El equipo de administración revisa los reportes para tomar las medidas disciplinarias oportunas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Responsabilidad en Partidas Presenciales</h2>
            <p>
              Ludiclub facilita el contacto y la coordinación entre personas con aficiones compartidas. Los usuarios son responsables de acordar puntos de encuentro en lugares públicos o privados y de velar por su propia seguridad. Ludiclub no se responsabiliza de incidencias o desavenencias personales ocurridas fuera de la plataforma digital.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Propiedad Intelectual y Atribuciones</h2>
            <p>
              Los nombres, imágenes de portadas y datos descriptivos de juegos de mesa mostrados en Ludiclub pertenecen a sus respectivos autores, editoriales y titulares de derechos de autor, integrados a través de fuentes públicas y la API de BoardGameGeek con fines informativos para la comunidad.
            </p>
          </section>
        </>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or creating an account on <strong>Ludiclub</strong>, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must not use our service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Zero Tolerance for Objectionable Content & Harassment (UGC)</h2>
            <p>
              Ludiclub maintains a <strong>strict zero-tolerance policy</strong> regarding objectionable content and abusive conduct, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Hate speech, discrimination, harassment, defamation, or violent threats.</li>
              <li>Sexually explicit or inappropriate imagery in avatars, match titles, or chats.</li>
              <li>Spam, commercial solicitation, or malicious links.</li>
            </ul>
            <p>
              Violators are subject to immediate account termination and permanent bans.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Reporting & User Blocking</h2>
            <p>
              Users can report objectionable content or block abusive users at any time directly through in-app menus. Our team reviews flagged reports to enforce community guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. In-Person Meetup Disclaimer</h2>
            <p>
              Ludiclub provides digital scheduling and communication tools. Participants are responsible for choosing safe locations and exercising standard precautions when meeting other players offline.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Intellectual Property</h2>
            <p>
              Board game artwork, names, and metadata belong to their respective publishers and designers, sourced via public databases including BoardGameGeek for informational community purposes.
            </p>
          </section>
        </>
      )}
    </LegalLayout>
  )
}
