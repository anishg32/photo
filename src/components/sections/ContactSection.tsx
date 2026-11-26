import { Mail, Phone, MapPin } from "lucide-react";
import type { SiteSettings } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { BookingForm } from "@/components/forms/BookingForm";

export function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section
      id="contact"
      className="py-24 sm:py-32 bg-[#0c0c0c] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal>
              <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
                08 · Commissions &amp; Bookings
              </p>
              <h2
                id="booking-form-heading"
                className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight"
              >
                Begin Your Visual Chapter.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
                We accept a select number of weddings, editorial commissions, and
                portrait sittings each season to preserve unhurried artistic
                attention for every story.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="pt-6 border-t border-white/10 space-y-4 text-sm">
                <div className="flex items-start gap-3 text-[#A0A0A0]">
                  <Mail aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                      Studio Desk
                    </p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-white hover:text-[#C6A46A] transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[#A0A0A0]">
                  <Phone aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                      Telephone
                    </p>
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                      className="text-white hover:text-[#C6A46A] transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[#A0A0A0]">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                      Atelier
                    </p>
                    <p className="text-white">{settings.studioAddress}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-7">
            <div className="liquid-glass rounded-2xl p-6 sm:p-10">
              <BookingForm services={settings.services} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

