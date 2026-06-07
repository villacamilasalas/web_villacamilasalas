import { Resend } from "resend";
import { z } from "zod";

const ContactSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  correo: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  mensaje: z.string().min(10, { message: "El mensaje debe contener al menos 10 caracteres." }),
});

const resend = new Resend(process.env.RESEND_API);

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ mensajeGlobal: "Método no permitido." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const formData = await req.formData();

    const honeypot = formData.get("organizacion");
    if (honeypot && honeypot.toString().trim() !== "") {
      return new Response(
        JSON.stringify({ exito: true, mensajeGlobal: "Mensaje recibido correctamente." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const datosCrudos = {
      nombre: formData.get("nombre"),
      correo: formData.get("correo"),
      mensaje: formData.get("mensaje"),
    };

    const validacion = ContactSchema.safeParse(datosCrudos);
    if (!validacion.success) {
      return new Response(
        JSON.stringify({
          exito: false,
          errores: validacion.error.flatten().fieldErrors,
          mensajeGlobal: "Error de validación en los datos provistos.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { nombre, correo, mensaje } = validacion.data;

    const { data, error } = await resend.emails.send({
      from: "Formulario de Contacto <contacto@mail.villacamilasalas.es>",
      to: ["villacamila22@hotmail.com"],
      replyTo: correo,
      subject: `Consulta de ${nombre}, posible Huesped`,
      html: `
        <div style="background:#fdfbf7; font-family:Inter,'Segoe UI',system-ui,sans-serif; padding:40px 20px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">

            <div style="background:#1a2e1a; padding:36px 40px 32px; text-align:center;">
              <img src="https://villacamilasalas.com/logo.jpeg" alt="Villa Camila" style="height:36px; width:auto; margin-bottom:10px;" />
              <p style="font-family:Georgia,'Times New Roman',serif; color:#fdfbf7; font-size:22px; margin:0; letter-spacing:3px; text-transform:uppercase;">Villa Camila</p>
              <p style="color:#a8b5a0; font-size:11px; margin:8px 0 0; letter-spacing:2.5px; text-transform:uppercase;">Apartamentos Rurales \u00b7 Asturias</p>
            </div>

            <div style="padding:32px 40px; color:#2d2d2d;">
              <h2 style="font-family:Georgia,'Times New Roman',serif; color:#1a2e1a; font-size:18px; font-weight:400; margin:0 0 24px;">Nueva solicitud de contacto</h2>

              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0; color:#8c8c8c; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; width:90px; vertical-align:top;">Remitente</td>
                  <td style="padding:8px 0; font-size:14px; line-height:1.5;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#8c8c8c; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; width:90px; vertical-align:top;">Email</td>
                  <td style="padding:8px 0; font-size:14px; line-height:1.5;">
                    <a href="mailto:${correo}" style="color:#1a2e1a; text-decoration:underline; text-underline-offset:2px;">${correo}</a>
                  </td>
                </tr>
              </table>

              <hr style="border:none; border-top:1px solid #e8e3da; margin:24px 0;" />

              <p style="font-size:11px; color:#8c8c8c; text-transform:uppercase; letter-spacing:1.5px; margin:0 0 12px;">Mensaje</p>
              <div style="background:#f8f6f2; padding:20px; border-left:3px solid #1a2e1a; border-radius:4px; font-size:14px; line-height:1.7; color:#2d2d2d;">
                ${mensaje.replace(/\n/g, "<br>")}
              </div>
            </div>

            <div style="background:#f8f6f2; padding:20px 40px; text-align:center; border-top:1px solid #e8e3da;">
              <p style="font-size:11px; color:#a8a8a8; margin:0;">
                Villa Camila Apartamentos &middot; Salas, Asturias &middot;
                <a href="tel:+34689575612" style="color:#1a2e1a; text-decoration:none;">+34 689 57 56 12</a>
              </p>
            </div>

          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error devuelto por la API de Resend:", error);
      return new Response(
        JSON.stringify({ exito: false, mensajeGlobal: "La infraestructura de correo rechazó la petición." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ exito: true, mensajeGlobal: "¡Tu mensaje ha sido enviado con éxito!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Excepción interna en la función:", err);
    return new Response(
      JSON.stringify({ exito: false, mensajeGlobal: "Ocurrió un error interno al procesar tu solicitud." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
