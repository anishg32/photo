"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Aperture,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { signInAdmin } from "@/lib/firebase-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInAdmin(email.trim(), password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Authentication failed. Verify your administrator credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col justify-center items-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Return to Portfolio</span>
          </Link>

          <div className="flex justify-center pt-2">
            <div className="h-12 w-12 rounded-full border border-[#C6A46A]/40 bg-[#111111] flex items-center justify-center">
              <Aperture aria-hidden="true" className="h-6 w-6 text-[#C6A46A]" />
            </div>
          </div>

          <h1 className="font-editorial text-4xl text-white font-normal">
            Studio Admin Access
          </h1>
          <p className="text-xs text-[#A0A0A0] tracking-wide">
            Protected portal for authorized MJ PHOTOGRAPHY administrators only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          method="POST"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
            >
              Administrator Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="studio-input w-full rounded-lg px-4 py-3 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC]"
              >
                Password
              </label>
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="inline-flex items-center gap-1 text-[11px] text-[#A0A0A0] hover:text-[#C6A46A]"
              >
                {showPassword ? (
                  <>
                    <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="studio-input w-full rounded-lg px-4 py-3 text-sm"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5"
            >
              <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold py-3.5 px-6 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] disabled:opacity-60 transition-colors min-h-[48px]"
          >
            <Lock aria-hidden="true" className="h-4 w-4" />
            <span>{loading ? "Verifying Credentials..." : "Sign In to Studio"}</span>
          </button>

          <p className="text-[11px] text-center text-[#888888] pt-1">
            Admin accounts are provisioned strictly via server-side Firebase
            custom claims. Public registration is disabled.
          </p>
        </form>
      </div>
    </div>
  );
}

