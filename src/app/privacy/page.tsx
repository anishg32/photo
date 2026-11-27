import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCachedSiteSettings } from "@/lib/portfolio-cache";
import { DEFAULT_SITE_SETTINGS } from "@/lib/studio-catalog";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How MJ PHOTOGRAPHY collects, protects, and manages booking enquiry details and photography assets.",
};

async function PrivacyContactEmail() {
  const settings = await getCachedSiteSettings();
  return (
    <a
      href={`mailto:${settings.email}`}
      className="text-[#C6A46A] underline underline-offset-4"
    >
      {settings.email}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          <span>Back to Studio Home</span>
        </Link>

        <header className="space-y-3 border-b border-white/10 pb-8">
          <p className="font-mono text-xs tracking-[0.24em] uppercase text-[#C6A46A]">
            Legal &amp; Confidentiality
          </p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-normal text-white">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#A0A0A0]">
            Effective Date: November 2026
          </p>
        </header>

        <div className="space-y-8 text-sm sm:text-base text-[#CCCCCC] leading-relaxed prose-editorial">
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-white">
              1. Information We Collect
            </h2>
            <p>
              When you submit a photography booking enquiry or optional client
              testimonial through MJ PHOTOGRAPHY, we collect only the contact
              and project details you voluntarily provide—such as your full
              name, email address, phone number, preferred date, location, and
              session message.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-white">
              2. Storage &amp; Security Architecture
            </h2>
            <p>
              All enquiry records, client reflections, and archival images are
              stored securely using Google Firebase services (Cloud Firestore and
              Firebase Storage) protected by strict security rules, server-side
              schema validation, rate limiting, and Firebase App Check. Booking
              records are accessible exclusively to authenticated studio
              administrators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-white">
              3. Client Testimonials &amp; Media Rights
            </h2>
            <p>
              Client testimonials are never published automatically; each
              submission undergoes administrator review before public display.
              Client photographs appear in public portfolios only with written
              commission agreement or explicit release.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-white">
              4. Data Deletion Requests
            </h2>
            <p>
              You may request access to, correction of, or permanent deletion of
              your booking enquiry information at any time by contacting{" "}
              <Suspense
                fallback={
                  <a
                    href={`mailto:${DEFAULT_SITE_SETTINGS.email}`}
                    className="text-[#C6A46A] underline underline-offset-4"
                  >
                    {DEFAULT_SITE_SETTINGS.email}
                  </a>
                }
              >
                <PrivacyContactEmail />
              </Suspense>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

