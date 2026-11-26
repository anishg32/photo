"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { getAppCheckHeaders } from "@/lib/firebase";
import type { StudioService } from "@/types";

interface BookingFormProps {
  services: StudioService[];
  defaultService?: string;
}

export function BookingForm({
  services,
  defaultService = "",
}: BookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRegionId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [serverFeedback, setServerFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState(
    defaultService || services[0]?.title || "Wedding Photography"
  );
  const [preferredDate, setPreferredDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (defaultService) {
      setServiceType(defaultService);
    }
  }, [defaultService]);

  // Sync :user-invalid CSS state to aria-invalid & error aria-describedby after blur/submit
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const controls = form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input:not([type='hidden']), select, textarea");

    controls.forEach((el) => el.setAttribute("aria-invalid", "false"));

    const syncField = (el: HTMLElement) => {
      if (!el.matches("input, select, textarea")) return;
      const inputEl = el as HTMLInputElement;
      const isInvalid = CSS.supports("selector(:user-invalid)")
        ? inputEl.matches(":user-invalid")
        : !inputEl.validity.valid && inputEl.classList.contains("user-invalid-fallback");

      inputEl.setAttribute("aria-invalid", isInvalid ? "true" : "false");
      const errorId = inputEl.dataset.error;
      if (errorId) {
        const existing = (inputEl.getAttribute("aria-describedby") || "")
          .split(/\s+/)
          .filter((id) => id && id !== errorId);
        if (isInvalid) existing.push(errorId);
        if (existing.length) {
          inputEl.setAttribute("aria-describedby", existing.join(" "));
        } else {
          inputEl.removeAttribute("aria-describedby");
        }
      }
    };

    const onBlur = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!CSS.supports("selector(:user-invalid)") && typeof target.checkValidity === "function") {
        target.classList.toggle("user-invalid-fallback", !target.validity.valid);
      }
      syncField(target);
    };

    const onInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!CSS.supports("selector(:user-invalid)") && typeof target.checkValidity === "function") {
        if (target.validity.valid) {
          target.classList.remove("user-invalid-fallback");
        }
      }
      syncField(target);
    };

    const onInvalid = (e: Event) => {
      const target = e.target as HTMLInputElement;
      target.classList.add("user-invalid-fallback");
      syncField(target);
    };

    form.addEventListener("blur", onBlur, true);
    form.addEventListener("input", onInput);
    form.addEventListener("invalid", onInvalid, true);

    return () => {
      form.removeEventListener("blur", onBlur, true);
      form.removeEventListener("input", onInput);
      form.removeEventListener("invalid", onInvalid, true);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLElement>(
        "input:invalid, select:invalid, textarea:invalid"
      );
      firstInvalid?.focus();
      return;
    }

    setSubmitting(true);
    setServerFeedback(null);

    try {
      const appCheckHeaders = await getAppCheckHeaders();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...appCheckHeaders,
        },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          serviceType,
          preferredDate,
          location,
          message,
          website: honeypot,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok || !payload.ok) {
        setServerFeedback({
          type: "error",
          message:
            payload.error ||
            "Your enquiry could not be saved right now. Please verify your details or reach out directly via studio email.",
        });
        return;
      }

      setServerFeedback({
        type: "success",
        message:
          payload.message ||
          "Your photography enquiry has been safely received.",
      });

      setCustomerName("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setLocation("");
      setMessage("");
      form.reset();
    } catch {
      setServerFeedback({
        type: "error",
        message:
          "Network error while submitting your enquiry. Please try again shortly.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      method="POST"
      noValidate={false}
      aria-labelledby="booking-form-heading"
      className="space-y-6"
    >
      <p className="text-xs text-[#A0A0A0]">
        Fields marked <span aria-hidden="true">*</span> are required.
      </p>

      {/* Honeypot field hidden from keyboard and screen readers */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="booking-name"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="booking-name"
            name="customerName"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            enterKeyHint="next"
            data-error="booking-name-error"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-3 text-sm"
          />
          <div id="booking-name-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Please enter your full name (at least 2 characters).</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-email"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Email Address <span aria-hidden="true">*</span>
          </label>
          <span id="booking-email-hint" className="block text-[11px] text-[#888888] mb-1">
            Format: you@example.com
          </span>
          <input
            id="booking-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            aria-describedby="booking-email-hint"
            data-error="booking-email-error"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-3 text-sm"
          />
          <div id="booking-email-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Enter a valid email address in the format you@example.com.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="booking-phone"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Phone Number <span aria-hidden="true">*</span>
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            required
            minLength={7}
            autoComplete="tel"
            inputMode="tel"
            enterKeyHint="next"
            data-error="booking-phone-error"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-3 text-sm"
          />
          <div id="booking-phone-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Please provide a valid phone number.</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-service"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Photography Service <span aria-hidden="true">*</span>
          </label>
          <select
            id="booking-service"
            name="serviceType"
            required
            data-error="booking-service-error"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="studio-select w-full rounded-lg px-4 py-3 text-sm"
          >
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
          <div id="booking-service-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Please choose a photography service.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="booking-date"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Preferred Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="booking-date"
            name="preferredDate"
            type="date"
            required
            data-error="booking-date-error"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-3 text-sm"
          />
          <div id="booking-date-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Please select your preferred date.</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-location"
            className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
          >
            Event / Session Location <span aria-hidden="true">*</span>
          </label>
          <input
            id="booking-location"
            name="location"
            type="text"
            required
            minLength={2}
            placeholder="City, venue, or destination"
            enterKeyHint="next"
            data-error="booking-location-error"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-3 text-sm"
          />
          <div id="booking-location-error" className="field-error-msg">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Please enter the event or shoot location.</span>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="booking-message"
          className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
        >
          Your Vision &amp; Details <span aria-hidden="true">*</span>
        </label>
        <span id="booking-message-hint" className="block text-[11px] text-[#888888] mb-1">
          Share timeline, atmosphere, and aesthetic references (at least 10 characters).
        </span>
        <textarea
          id="booking-message"
          name="message"
          required
          minLength={10}
          rows={5}
          aria-describedby="booking-message-hint"
          data-error="booking-message-error"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="studio-textarea w-full rounded-lg px-4 py-3 text-sm resize-y"
        />
        <div id="booking-message-error" className="field-error-msg">
          <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>Please share a brief note (at least 10 characters).</span>
        </div>
      </div>

      <div id={statusRegionId} role="status" aria-live="polite">
        {serverFeedback && (
          <div
            className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
              serverFeedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/35 text-emerald-200"
                : "border-red-500/40 bg-red-950/35 text-red-200"
            }`}
          >
            {serverFeedback.type === "success" ? (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <span>{serverFeedback.message}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-3 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#d8b87d] disabled:opacity-60 transition-colors min-h-[50px] w-full sm:w-auto"
      >
        <Send aria-hidden="true" className="h-4 w-4" />
        <span>{submitting ? "Sending Enquiry..." : "Submit Booking Enquiry"}</span>
      </button>
    </form>
  );
}
