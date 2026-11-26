"use client";

import { useState } from "react";
import { Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import type { Booking, BookingStatus } from "@/types";
import { BOOKING_STATUSES } from "@/lib/validation";

export function BookingsManagerPanel({
  bookings,
  onRefresh,
}: {
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<BookingStatus | "All">("All");

  const visible =
    filter === "All"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const updateStatus = async (id: string, status: BookingStatus) => {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await onRefresh();
  };

  const deleteBooking = async (id: string) => {
    await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-editorial text-2xl text-white">
          Booking Enquiries ({visible.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {(["All", ...BOOKING_STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] border ${
                filter === status
                  ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
                  : "border-white/15 text-[#A0A0A0] hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-sm text-[#A0A0A0]">
          No booking enquiries match the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#C6A46A]">
                    {booking.serviceType}
                  </p>
                  <h3 className="font-editorial text-2xl text-white">
                    {booking.customerName}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <label className="visually-hidden" htmlFor={`status-${booking.id}`}>
                    Status for {booking.customerName}
                  </label>
                  <select
                    id={`status-${booking.id}`}
                    value={booking.status}
                    onChange={(e) =>
                      updateStatus(booking.id, e.target.value as BookingStatus)
                    }
                    className="studio-select rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.14em] min-h-[38px]"
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Delete enquiry from ${booking.customerName}`}
                    onClick={() => deleteBooking(booking.id)}
                    className="rounded-full p-2 border border-red-500/30 text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[#CCCCCC]">
                <p className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span>{booking.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span>{booking.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span className="font-mono">{booking.preferredDate}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span>{booking.location}</span>
                </p>
              </div>

              <p className="rounded-xl bg-[#0a0a0a] border border-white/5 p-4 text-sm text-[#CCCCCC] leading-relaxed">
                {booking.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

