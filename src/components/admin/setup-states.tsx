import Link from "next/link";
import { Database, ShieldAlert } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

function Shell({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-lift ring-1 ring-ink/5 sm:p-12">
        <span className="grid size-14 place-items-center rounded-2xl bg-blush text-pink-deep">{icon}</span>
        <h1 className="mt-6 font-display text-3xl font-medium">{title}</h1>
        <div className="mt-4 space-y-4 text-ink-2">{children}</div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SignOutButton />
          <Link href="/" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-ink-3 hover:text-ink">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

const code = "rounded-lg bg-paper px-1.5 py-0.5 font-mono text-[0.85em] text-ink";

export function SetupNeeded({ email }: { email: string }) {
  return (
    <Shell icon={<Database className="size-6" />} title="Falta configurar la base de datos">
      <p>Tu sesión funciona, pero las tablas de Supabase aún no existen. Solo tienes que hacerlo una vez:</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Abre tu proyecto en <strong>supabase.com</strong> → <strong>SQL Editor</strong> → <strong>New query</strong>.
        </li>
        <li>
          Pega todo el contenido del archivo <code className={code}>supabase/schema.sql</code> y pulsa <strong>Run</strong>.
        </li>
        <li>
          Ejecuta también: <code className={code}>{`insert into public.admins (email) values ('${email}');`}</code>
        </li>
        <li>Recarga esta página.</li>
      </ol>
    </Shell>
  );
}

export function NotAuthorized({ email }: { email: string }) {
  return (
    <Shell icon={<ShieldAlert className="size-6" />} title="Este correo no tiene acceso al panel">
      <p>
        Iniciaste sesión como <strong>{email}</strong>, pero no está registrado como administrador.
      </p>
      <p>
        Para darle acceso, en Supabase → SQL Editor ejecuta:
        <br />
        <code className={code}>{`insert into public.admins (email) values ('${email}');`}</code>
      </p>
    </Shell>
  );
}
