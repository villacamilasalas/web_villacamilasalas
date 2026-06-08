"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  correo: z.string().email("Por favor, introduce un correo electrónico válido."),
  mensaje: z.string().min(10, "El mensaje debe contener al menos 10 caracteres."),
})

type ContactData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactData>()

  const onSubmit = async (data: ContactData) => {
    const result = contactSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      if (fieldErrors.nombre) setError("nombre", { message: fieldErrors.nombre[0] })
      if (fieldErrors.correo) setError("correo", { message: fieldErrors.correo[0] })
      if (fieldErrors.mensaje) setError("mensaje", { message: fieldErrors.mensaje[0] })
      return
    }

    setPending(true)

    const formData = new FormData()
    formData.append("organizacion", "")
    formData.append("nombre", data.nombre)
    formData.append("correo", data.correo)
    formData.append("mensaje", data.mensaje)

    try {
      const res = await fetch("/api/contact", { method: "POST", body: formData })
      const json = await res.json()

      if (json.exito) {
        toast.success(json.mensajeGlobal)
        reset()
      } else {
        if (json.errores?.nombre) setError("nombre", { message: json.errores.nombre[0] })
        if (json.errores?.correo) setError("correo", { message: json.errores.correo[0] })
        if (json.errores?.mensaje) setError("mensaje", { message: json.errores.mensaje[0] })
        if (json.mensajeGlobal) toast.error(json.mensajeGlobal)
      }
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="organizacion">Nombre de empresa</label>
        <input
          id="organizacion"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("organizacion" as any)}
        />
      </div>

      <div>
        <label htmlFor="nombre" className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          disabled={pending}
          className="mt-2 block w-full rounded-xl border-0 bg-secondary/50 px-5 py-4 text-foreground ring-1 ring-inset ring-border/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 transition-editorial"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="mt-1.5 text-xs text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="correo" className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Email
        </label>
        <input
          id="correo"
          type="email"
          placeholder="tu@email.com"
          disabled={pending}
          className="mt-2 block w-full rounded-xl border-0 bg-secondary/50 px-5 py-4 text-foreground ring-1 ring-inset ring-border/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 transition-editorial"
          {...register("correo")}
        />
        {errors.correo && (
          <p className="mt-1.5 text-xs text-destructive">{errors.correo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          rows={4}
          placeholder="¿En qué podemos ayudarte?"
          disabled={pending}
          className="mt-2 block w-full resize-none rounded-xl border-0 bg-secondary/50 px-5 py-4 text-foreground ring-1 ring-inset ring-border/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 transition-editorial"
          {...register("mensaje")}
        />
        {errors.mensaje && (
          <p className="mt-1.5 text-xs text-destructive">{errors.mensaje.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="btn-tactile w-full py-6 text-base disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Enviando mensaje\u2026" : "Enviar mensaje"}
      </Button>
    </form>
  )
}
