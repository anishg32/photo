import { Suspense } from "react";
import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { getSiteSettings } from "@/lib/firestore";
import { BookingForm } from "@/components/forms/BookingForm";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description:
    "Inquire about wedding commissions, portrait sittings, fashion campaigns, and bespoke editorial assignments with MJ PHOTOGRAPHY.",
};

async function ContactPageContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [settings, resolvedParams] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  const preselectedService =
    typeof resolvedParams.service === "string" ? resolvedParams.service : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-4">
          <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
            Private Studio Desk
          </p>
          <h1
            id="booking-form-heading"
            className="font-editorial text-5xl sm:text-6xl font-normal text-white leading-tight"
          >
            Reserve Your Commission.
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
            Share your dates, venue, and creative vision. Every enquiry is
            reviewed directly by the studio and saved securely in our archive.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5 text-sm">
          <div className="flex items-start gap-3">
            <Mail aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">
                Email
              </p>
              <a
                href={`mailto:${settings.email}`}
                className="text-white hover:text-[#C6A46A]"
              >
                {settings.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">
                Telephone
              </p>
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="text-white hover:text-[#C6A46A]"
              >
                {settings.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="h-4 w-4 text-[#C6A46A] mt-1 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">
                Studio Location
              </p>
              <p className="text-white">{settings.studioAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/80 hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>Instagram</span>
              </a>
            )}
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white/80 hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="liquid-glass rounded-2xl p-6 sm:p-10">
          <BookingForm
            services={settings.services}
            defaultService={preselectedService}
          />
        </div>
      </div>
    </div>
  );
}

export default function ContactPage(props: {
  searchParams: Promise<{ service?: string }>;
}) {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Suspense
          fallback={
            <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              Loading booking consultation desk...
            </div>
          }
        >
          <ContactPageContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
