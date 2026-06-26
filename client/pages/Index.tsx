import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PdfLayout from "@/components/PdfLayout";
import {
  departureCities,
  destinations,
  paymentPresets,
  suggestTripTitles,
  templates,
} from "@/data/options";
import {
  ItineraryData,
  Installment,
  Flight,
  HotelBooking,
  buildDefaultDays,
  calcReturnDate,
  applyPaymentPreset,
  regenerateSuggestions,
  computeNights,
  makeEmptyData,
} from "@/hooks/useItineraryStore";
import { addDays, format } from "date-fns";
import { generatePdfFromElement } from "@/utils/pdf";

const money = (n: number) => `₹ ${Math.round(n).toLocaleString()}`;

const PDF_PAGE_WIDTH = 794;
const PDF_PAGE_HEIGHT = 1123;
const PDF_PAGE_COUNT = 5;

export default function Index() {
  const [data, setData] = useState<ItineraryData>(() => {
    const d = makeEmptyData();
    d.destination = "Singapore" as any;
    d.days = buildDefaultDays("Singapore", undefined, d.duration, d.template);
    d.installments = applyPaymentPreset(d.totalAmount, d.paymentPreset);
    d.title = suggestTripTitles("Singapore", d.travellers)[0] || "Itinerary";
    return d;
  });

  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({
    class: "Economy",
  });
  const [travelerName, setTravelerName] = useState("Rahul");
  const [visaType, setVisaType] = useState("");
  const [visaValidity, setVisaValidity] = useState("");
  const [visaProcessingDate, setVisaProcessingDate] = useState("");
  const flightTimes = [
    "05:30",
    "06:45",
    "08:00",
    "10:15",
    "12:30",
    "14:45",
    "17:00",
    "19:15",
    "21:30",
    "23:55",
  ];

  const dest = data.destination ? destinations[data.destination] : undefined;
  const titleSuggestions = useMemo(
    () => suggestTripTitles(data.destination || "", data.travellers),
    [data.destination, data.travellers],
  );

  const pdfRootRef = useRef<HTMLDivElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  useEffect(() => {
    if (data.departureDate && data.duration) {
      const returnDate = calcReturnDate(data.departureDate, data.duration);
      setData((prev) => ({
        ...prev,
        returnDate,
        days: prev.days.map((d, i) => ({
          ...d,
          date: format(addDays(new Date(data.departureDate!), i), "yyyy-MM-dd"),
        })),
      }));
    }
  }, [data.departureDate, data.duration]);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const updatePreviewScale = () => {
      const availableWidth = Math.max(0, container.clientWidth - 32);
      const nextScale = Math.min(
        0.72,
        Math.max(0.28, availableWidth / PDF_PAGE_WIDTH),
      );
      setPreviewScale(nextScale);
    };

    updatePreviewScale();
    const resizeObserver = new ResizeObserver(updatePreviewScale);
    resizeObserver.observe(container);
    window.addEventListener("resize", updatePreviewScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePreviewScale);
    };
  }, []);

  const regenerate = () => setData((prev) => regenerateSuggestions(prev));

  const onChangeTotal = (val: number) => {
    setData((prev) => {
      const next = { ...prev, totalAmount: val };
      if (prev.paymentPreset !== "Custom") {
        next.installments = applyPaymentPreset(val, prev.paymentPreset);
      }
      return next;
    });
  };

  const handlePresetChange = (preset: ItineraryData["paymentPreset"]) => {
    setData((prev) => ({
      ...prev,
      paymentPreset: preset,
      installments:
        preset === "Custom"
          ? prev.installments
          : applyPaymentPreset(prev.totalAmount, preset),
    }));
  };

  const addDay = () => {
    setData((prev) => {
      const i = prev.days.length;
      const date = prev.departureDate
        ? format(addDays(new Date(prev.departureDate), i), "yyyy-MM-dd")
        : "";
      const firstHotel = prev.destination
        ? destinations[prev.destination].hotels[0]?.id
        : undefined;
      return {
        ...prev,
        duration: prev.duration + 1,
        days: [
          ...prev.days,
          {
            label: `Day ${i + 1}`,
            date,
            activities: {
              morning: undefined,
              afternoon: undefined,
              evening: undefined,
            },
            transport: "No Transfer",
            hotelId: firstHotel,
          },
        ],
      };
    });
  };

  const removeDay = (idx: number) => {
    if (!confirm("Remove this day?")) return;
    setData((prev) => {
      const days = prev.days.filter((_, i) => i !== idx);
      return { ...prev, days, duration: Math.max(1, prev.duration - 1) };
    });
  };

  const onAddFlight = () => {
    if (
      !newFlight.date ||
      !newFlight.airline ||
      !newFlight.time ||
      !newFlight.from ||
      !newFlight.to
    )
      return;
    const f: Flight = {
      id: Math.random().toString(36).slice(2),
      date: newFlight.date!,
      airline: newFlight.airline!,
      time: newFlight.time!,
      from: newFlight.from!,
      to: newFlight.to!,
      class: (newFlight.class as any) || "Economy",
      transfer: newFlight.transfer,
    };
    setData((prev) => ({ ...prev, flights: [...prev.flights, f] }));
    setNewFlight({ class: "Economy" });
    setFlightModalOpen(false);
  };

  const addBookingRow = () => {
    const b: HotelBooking = {
      id: Math.random().toString(36).slice(2),
      city: data.destination || "Singapore",
      checkIn: data.departureDate || "",
      checkOut: data.returnDate || "",
      nights: 0,
    };
    setData((p) => ({ ...p, bookings: [...p.bookings, b] }));
  };

  const onGeneratePdf = async () => {
    if (!data.title || !data.departureDate || !data.days.length) {
      alert(
        "Please fill Trip Title, Dates, and at least one Day before generating PDF.",
      );
      return;
    }
    const el = pdfRootRef.current;
    if (!el) return;
    const dateStr = format(new Date(), "yyyyMMdd");
    const fileName = `Itinerary_${(data.title || "Trip").replace(/\s+/g, "_")}_${dateStr}.pdf`;
    await generatePdfFromElement(el, fileName);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-brand-50 to-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700" />
            <div className="font-display text-xl font-extrabold text-brand-900">
              Itinerary Builder
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={regenerate}>
              Regenerate suggestions
            </Button>
            <Button onClick={onGeneratePdf}>Get Itinerary (PDF)</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(480px,520px)]">
        <section className="min-w-0 space-y-6">
          {/* Trip Overview */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <h2 className="font-display text-lg font-bold text-brand-900">
              Trip Overview
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">Trip Title</label>
                <input
                  list="title-suggest"
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
                <datalist id="title-suggest">
                  {titleSuggestions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Destination</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.destination}
                  onChange={(e) => {
                    const destination = e.target
                      .value as ItineraryData["destination"];
                    const days = destination
                      ? buildDefaultDays(
                          destination as any,
                          data.departureDate,
                          data.duration,
                          data.template,
                        )
                      : [];
                    const title =
                      suggestTripTitles(
                        destination || "",
                        data.travellers,
                      )[0] || data.title;
                    setData({ ...data, destination, days, title });
                  }}
                >
                  {Object.keys(destinations).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Template</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.template}
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      template: e.target.value as any,
                      days: p.destination
                        ? buildDefaultDays(
                            p.destination as any,
                            p.departureDate,
                            p.duration,
                            e.target.value as any,
                          )
                        : p.days,
                    }))
                  }
                >
                  {Object.keys(templates).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Duration (days)
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.duration}
                  onChange={(e) =>
                    setData((p) => ({ ...p, duration: Number(e.target.value) }))
                  }
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Travellers</label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border overflow-hidden shrink-0">
                    <button
                      className="px-3 py-2"
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          travellers: Math.max(1, p.travellers - 1),
                        }))
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="w-16 text-center py-2"
                      value={data.travellers}
                      onChange={(e) =>
                        setData({
                          ...data,
                          travellers: Math.max(1, Number(e.target.value || 1)),
                        })
                      }
                    />
                    <button
                      className="px-3 py-2"
                      onClick={() =>
                        setData((p) => ({ ...p, travellers: p.travellers + 1 }))
                      }
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: "Solo", v: 1 },
                      { l: "Couple", v: 2 },
                      { l: "Family of 4", v: 4 },
                      { l: "Group of 6", v: 6 },
                    ].map((p) => (
                      <Button
                        key={p.l}
                        variant="outline"
                        onClick={() =>
                          setData((d) => ({ ...d, travellers: p.v }))
                        }
                      >
                        {p.l}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Departure City
                </label>
                <input
                  list="cities"
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.departureCity}
                  onChange={(e) =>
                    setData({ ...data, departureCity: e.target.value })
                  }
                />
                <datalist id="cities">
                  {departureCities.map((c) => (
                    <option key={`${c.country}-${c.city}`} value={c.city}>
                      {c.country} — {c.city}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.departureDate || ""}
                  onChange={(e) =>
                    setData((p) => ({ ...p, departureDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Return Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.returnDate || ""}
                  onChange={(e) =>
                    setData((p) => ({ ...p, returnDate: e.target.value }))
                  }
                />
                <div className="text-xs text-slate-500 mt-1">
                  Auto-calculated from start + duration
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Departure/Arrival Options
                </label>
                <div className="flex gap-4 text-sm mt-2">
                  {(["Direct", "With Stopovers"] as const).map((s) => (
                    <label key={s} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="stop"
                        checked={data.stopovers === s}
                        onChange={() =>
                          setData((p) => ({ ...p, stopovers: s }))
                        }
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-200">
              <div className="text-sm text-slate-600">Summary</div>
              <div className="text-brand-900 font-semibold">
                {data.title || "—"}
              </div>
              <div className="text-sm text-slate-700">
                {data.destination} • {data.duration} days • {data.travellers}{" "}
                travellers
              </div>
            </div>
          </div>

          {/* Traveler & Visa Details */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <h2 className="font-display text-lg font-bold text-brand-900">
              Traveler & Visa Details
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">
                  Traveler Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Visa Type</label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="e.g., Tourist, Business"
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Visa Validity
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="e.g., 6 months from issue"
                  value={visaValidity}
                  onChange={(e) => setVisaValidity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Visa Processing Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2"
                  value={visaProcessingDate}
                  onChange={(e) => setVisaProcessingDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Day Builder */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-bold text-brand-900">
                Day Builder
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() =>
                    setData((p) => ({
                      ...p,
                      days: buildDefaultDays(
                        p.destination as any,
                        p.departureDate,
                        p.duration,
                        p.template,
                      ),
                    }))
                  }
                >
                  Apply Template
                </Button>
                <Button className="w-full sm:w-auto" variant="secondary" onClick={addDay}>
                  + Add Day
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {data.days.map((day, idx) => (
                <div key={idx} className="min-w-0 rounded-xl border p-3 sm:p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-brand-900 font-semibold">
                        {day.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {day.date || "Set start date for auto"}
                      </div>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:min-w-[260px]">
                      <input
                        className="min-w-0 w-full rounded-lg border px-2 py-2 text-sm sm:py-1"
                        value={day.label}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            days: p.days.map((d, i) =>
                              i === idx ? { ...d, label: e.target.value } : d,
                            ),
                          }))
                        }
                      />
                      <Button
                        className="w-full shrink-0 sm:w-auto"
                        variant="destructive"
                        onClick={() => removeDay(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
                    {(["morning", "afternoon", "evening"] as const).map(
                      (slot) => (
                        <div key={slot} className="min-w-0">
                          <label className="block text-slate-600 mb-1 capitalize">
                            {slot}
                          </label>
                          <select
                            className="min-w-0 w-full rounded-lg border px-3 py-2"
                            value={day.activities[slot] || ""}
                            onChange={(e) =>
                              setData((p) => ({
                                ...p,
                                days: p.days.map((d, i) =>
                                  i === idx
                                    ? {
                                        ...d,
                                        activities: {
                                          ...d.activities,
                                          [slot]: e.target.value || undefined,
                                        },
                                      }
                                    : d,
                                ),
                              }))
                            }
                          >
                            <option value="">Select activity</option>
                            {dest?.activities.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="min-w-0">
                      <label className="block text-slate-600 mb-1">
                        Transport
                      </label>
                      <select
                        className="min-w-0 w-full rounded-lg border px-3 py-2"
                        value={day.transport || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            days: p.days.map((d, i) =>
                              i === idx
                                ? { ...d, transport: e.target.value }
                                : d,
                            ),
                          }))
                        }
                      >
                        {dest?.transfers.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0">
                      <label className="block text-slate-600 mb-1">Hotel</label>
                      <select
                        className="min-w-0 w-full rounded-lg border px-3 py-2"
                        value={day.hotelId || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            days: p.days.map((d, i) =>
                              i === idx ? { ...d, hotelId: e.target.value } : d,
                            ),
                          }))
                        }
                      >
                        {dest?.hotels.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0">
                      <label className="block text-slate-600 mb-1">
                        Add custom activity (optional)
                      </label>
                      <input
                        className="min-w-0 w-full rounded-lg border px-3 py-2"
                        value={day.customActivity || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            days: p.days.map((d, i) =>
                              i === idx
                                ? { ...d, customActivity: e.target.value }
                                : d,
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Plan */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <h2 className="font-display text-lg font-bold text-brand-900">
              Payment Plan
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-slate-600 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2"
                  value={data.totalAmount}
                  onChange={(e) => onChangeTotal(Number(e.target.value || 0))}
                />
                <div className="text-xs text-slate-500 mt-1">
                  Suggested estimate per person x travellers
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Payment Preset
                </label>
                <div className="flex gap-3">
                  {(["FULL", "2-INST", "3-INST", "Custom"] as const).map(
                    (k) => (
                      <label
                        key={k}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          checked={data.paymentPreset === k}
                          onChange={() => handlePresetChange(k)}
                        />
                        <span>{k === "FULL" ? "Full Payment" : k}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead className="bg-brand-50 text-brand-900">
                  <tr>
                    <th className="text-left p-2">Installment</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Due Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.installments.map((ins, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <input
                          className="rounded border px-2 py-1"
                          value={ins.name}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              installments: p.installments.map((x, ix) =>
                                ix === i ? { ...x, name: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="rounded border px-2 py-1"
                          value={ins.amount}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              installments: p.installments.map((x, ix) =>
                                ix === i
                                  ? {
                                      ...x,
                                      amount: Number(e.target.value || 0),
                                    }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          className="rounded border px-2 py-1"
                          value={ins.dueDate || ""}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              installments: p.installments.map((x, ix) =>
                                ix === i
                                  ? { ...x, dueDate: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setData((p) => ({
                              ...p,
                              installments: p.installments.filter(
                                (_, ix) => ix !== i,
                              ),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setData((p) => ({
                      ...p,
                      installments: [
                        ...p.installments,
                        {
                          name: `Installment ${p.installments.length + 1}`,
                          amount: 0,
                        },
                      ],
                    }))
                  }
                >
                  Add Installment
                </Button>
              </div>
            </div>
          </div>

          {/* Flights & Transfers */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-brand-900">
                Flights & Transfers
              </h2>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => setFlightModalOpen(true)}
                >
                  Add Flight
                </Button>
              </div>
            </div>

            {flightModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setFlightModalOpen(false)}
                />
                <div className="relative bg-white rounded-lg p-6 max-w-xl w-full z-10">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <DialogHeader>
                      <DialogTitle>Add Flight</DialogTitle>
                    </DialogHeader>
                    <button
                      className="text-slate-500"
                      onClick={() => setFlightModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.date || ""}
                        onChange={(e) =>
                          setNewFlight((p) => ({ ...p, date: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">
                        Airline
                      </label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.airline || ""}
                        onChange={(e) =>
                          setNewFlight((p) => ({
                            ...p,
                            airline: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {dest?.airlines.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">
                        Flight Time
                      </label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.time || ""}
                        onChange={(e) =>
                          setNewFlight((p) => ({ ...p, time: e.target.value }))
                        }
                      >
                        <option value="">Select time</option>
                        {flightTimes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Class</label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.class || "Economy"}
                        onChange={(e) =>
                          setNewFlight((p) => ({
                            ...p,
                            class: e.target.value as any,
                          }))
                        }
                      >
                        {(["Economy", "Premium", "Business"] as const).map(
                          (c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">From</label>
                      <input
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.from || ""}
                        onChange={(e) =>
                          setNewFlight((p) => ({ ...p, from: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">To</label>
                      <input
                        className="w-full rounded-lg border px-3 py-2"
                        value={newFlight.to || ""}
                        onChange={(e) =>
                          setNewFlight((p) => ({ ...p, to: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button onClick={onAddFlight}>Add</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2 text-sm">
              {data.flights.length === 0 && (
                <div className="text-slate-500">No flights added</div>
              )}
              {data.flights.map((f) => (
                <div key={f.id} className="border rounded-lg p-3">
                  <div className="font-semibold">
                    {f.airline} — {f.time || f.flightNumber} ({f.class})
                  </div>
                  <div className="text-slate-600">
                    {f.from} → {f.to} •{" "}
                    {format(new Date(f.date), "dd MMM yyyy")}{" "}
                    {f.time ? `• ${f.time}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Bookings */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-brand-900">
                Hotel Bookings
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setData((p) => ({
                      ...p,
                      days: (p.destination
                        ? destinations[p.destination].hotels
                        : []
                      ).length
                        ? p.days.map((d, i) => ({
                            ...d,
                            hotelId:
                              destinations[p.destination!].hotels[
                                i % destinations[p.destination!].hotels.length
                              ].id,
                          }))
                        : p.days,
                    }))
                  }
                >
                  Auto assign hotels by day
                </Button>
                <Button variant="secondary" onClick={addBookingRow}>
                  Add booking row
                </Button>
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead className="bg-brand-50 text-brand-900">
                  <tr>
                    <th className="text-left p-2">City</th>
                    <th className="text-left p-2">Check-in</th>
                    <th className="text-left p-2">Check-out</th>
                    <th className="text-left p-2">Nights</th>
                    <th className="text-left p-2">Hotel</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b, i) => (
                    <tr key={b.id} className="border-t">
                      <td className="p-2">
                        <select
                          className="rounded border px-2 py-1"
                          value={b.city}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              bookings: p.bookings.map((x, ix) =>
                                ix === i ? { ...x, city: e.target.value } : x,
                              ),
                            }))
                          }
                        >
                          {Object.keys(destinations).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          className="rounded border px-2 py-1"
                          value={b.checkIn}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              bookings: p.bookings.map((x, ix) =>
                                ix === i
                                  ? {
                                      ...x,
                                      checkIn: e.target.value,
                                      nights: computeNights(
                                        e.target.value,
                                        x.checkOut,
                                      ),
                                    }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          className="rounded border px-2 py-1"
                          value={b.checkOut}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              bookings: p.bookings.map((x, ix) =>
                                ix === i
                                  ? {
                                      ...x,
                                      checkOut: e.target.value,
                                      nights: computeNights(
                                        x.checkIn,
                                        e.target.value,
                                      ),
                                    }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">{b.nights}</td>
                      <td className="p-2">
                        <select
                          className="rounded border px-2 py-1"
                          value={b.hotelId || ""}
                          onChange={(e) =>
                            setData((p) => ({
                              ...p,
                              bookings: p.bookings.map((x, ix) =>
                                ix === i
                                  ? { ...x, hotelId: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                        >
                          {destinations[
                            data.destination || "Singapore"
                          ].hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setData((p) => ({
                              ...p,
                              bookings: p.bookings.filter((_, ix) => ix !== i),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inclusions & Notes */}
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <h2 className="font-display text-lg font-bold text-brand-900">
              Inclusions / Exclusions / Scope
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="space-y-2">
                {(
                  [
                    ["flights", "Flights"],
                    ["breakfast", "Breakfast"],
                    ["transfers", "Transfers"],
                    ["sightseeing", "Sightseeing"],
                    ["localTaxes", "Local Taxes"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(data.inclusions as any)[k]}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          inclusions: {
                            ...p.inclusions,
                            [k]: e.target.checked,
                          } as any,
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-slate-600">Presets</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        inclusions: {
                          flights: true,
                          breakfast: true,
                          transfers: true,
                          sightseeing: true,
                          localTaxes: true,
                        },
                      }))
                    }
                  >
                    All-inclusive
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        inclusions: {
                          flights: false,
                          breakfast: true,
                          transfers: true,
                          sightseeing: true,
                          localTaxes: true,
                        },
                      }))
                    }
                  >
                    Basic Package
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-slate-600 mb-1">
                  Important Notes
                </label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 min-h-28"
                  value={data.notes}
                  onChange={(e) =>
                    setData((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Scope of Service
                </label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 min-h-28"
                  value={data.scope}
                  onChange={(e) =>
                    setData((p) => ({ ...p, scope: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Live Preview */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <div className="font-display text-lg font-bold text-brand-900">
              Live Preview
            </div>
            <div className="text-sm text-slate-600 mb-3">
              This is a simplified preview of the PDF layout.
            </div>
            <div
              ref={previewContainerRef}
              className="h-[min(680px,calc(100vh-18rem))] min-h-[360px] w-full overflow-y-auto overflow-x-hidden rounded-lg border bg-slate-100"
            >
              <div className="mx-auto w-fit py-4">
                <div
                  style={{
                    width: PDF_PAGE_WIDTH * previewScale,
                    height: PDF_PAGE_HEIGHT * PDF_PAGE_COUNT * previewScale,
                  }}
                >
                  <div
                    className="origin-top-left"
                    style={{ transform: `scale(${previewScale})` }}
                  >
                    <PdfLayout
                      data={data}
                      travelerName={travelerName}
                      visaType={visaType}
                      visaValidity={visaValidity}
                      visaProcessingDate={visaProcessingDate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm bg-white p-5">
            <div className="font-display text-lg font-bold text-brand-900">
              Totals
            </div>
            <div className="mt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Travellers</span>
                <span>{data.travellers}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span>{money(data.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Preset</span>
                <span>{data.paymentPreset}</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Hidden DOM for clean PDF rendering */}
      <div className="fixed -left-[9999px] top-0" aria-hidden ref={pdfRootRef}>
        <PdfLayout
          data={data}
          travelerName={travelerName}
          visaType={visaType}
          visaValidity={visaValidity}
          visaProcessingDate={visaProcessingDate}
        />
      </div>
    </div>
  );
}
