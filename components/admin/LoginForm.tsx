"use client";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { PasswordInput } from "./PasswordInput";
import { validateForm } from "@/lib/validate";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form className="form" action={action} noValidate onSubmit={(e) => { if (!validateForm(e.currentTarget)) e.preventDefault(); }}>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" inputMode="email" autoCapitalize="none" enterKeyHint="next" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" enterKeyHint="go" />
      </div>
      {state.message ? <p className="form-msg err" role="alert">{state.message}</p> : null}
      <div><button className="btn primary" type="submit" disabled={pending}>{pending ? "Memeriksa…" : "Masuk"}</button></div>
      <p className="form-note">Lupa password? Buat password baru dari terminal server: npm run user -- reset --email email-kamu</p>
    </form>
  );
}
