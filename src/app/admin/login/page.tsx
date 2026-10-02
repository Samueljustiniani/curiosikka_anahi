"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader, Lock } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Heart, Sparkle, Star } from "@/components/ui/illustrations";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si ya hay una sesión válida, directo al panel (getUser valida contra el servidor)
  useEffect(() => {
    getSupabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace("/admin");
      });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-40 top-0 size-[32rem] rounded-full bg-pink-soft/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[32rem] rounded-full bg-teal-soft blur-3xl" />
      <Sparkle className="absolute left-[15%] top-[18%] size-7 animate-twinkle" />
      <Star color="#b49be3" className="absolute right-[18%] top-[22%] size-5 animate-twinkle [animation-delay:1s]" />
      <Heart className="absolute bottom-[16%] right-[22%] size-6 animate-float" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-ink">
          <ArrowLeft className="size-4" /> Volver a la tienda
        </Link>
        <form onSubmit={submit} className="rounded-[2.25rem] bg-white/90 p-8 shadow-lift ring-1 ring-ink/5 backdrop-blur sm:p-10">
          <div className="flex items-center gap-3">
            <span className="relative size-14 overflow-hidden rounded-full ring-1 ring-pink/30">
              <Image src="/brand/logo-320.webp" alt="Curiosiika" fill sizes="56px" priority />
            </span>
            <div>
              <p className="eyebrow text-pink-deep">Panel</p>
              <h1 className="font-display text-3xl font-medium">Hola de nuevo</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-3">Ingresa con el correo autorizado para gestionar pedidos, productos y fechas.</p>

          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-semibold">Correo</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" required />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold">Contraseña</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-12"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:bg-paper"
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
          <Button type="submit" size="lg" className="mt-8 w-full" disabled={loading}>
            {loading ? <Loader className="size-4 animate-spin" /> : <Lock className="size-4" />} Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
