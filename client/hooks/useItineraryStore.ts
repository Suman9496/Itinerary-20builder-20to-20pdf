import { addDays, format } from "date-fns";
import {
  DestinationOptions,
  destinations,
  mapTemplateKeyToActivityId,
  paymentPresets,
  templates,
} from "@/data/options";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export type DayPlan = {
  label: string;
  date: string; // ISO date
  activities: Record<TimeOfDay, string | undefined>; // activity id per slot
  transport?: string;
  hotelId?: string;
  customActivity?: string;
};

export type Flight = {
  id: string;
  date: string;
  airline: string;
  time?: string; // e.g., 06:30, 13:45, Night 23:55
  flightNumber?: string;
  from: string;
  to: string;
  class: "Economy" | "Premium" | "Business";
  transfer?: { vehicle: string; company?: string };
};

export type Installment = { name: string; amount: number; dueDate?: string };

export type HotelBooking = {
  id: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  hotelId?: string;
};

export type Inclusions = {
  flights: boolean;
  breakfast: boolean;
  transfers: boolean;
  sightseeing: boolean;
  localTaxes: boolean;
};

export type ItineraryData = {
  title: string;
  destination: keyof typeof destinations | "";
  template: keyof typeof templates | "City Explorer";
  duration: number; // days
  travellers: number;
  departureCity: string;
  departureDate?: string; // ISO
  returnDate?: string; // ISO
  stopovers: "Direct" | "With Stopovers";
  days: DayPlan[];
  totalAmount: number;
  paymentPreset: keyof typeof paymentPresets | "FULL" | "2-INST" | "3-INST" | "Custom";
  installments: Installment[];
  flights: Flight[];
  bookings: HotelBooking[];
  inclusions: Inclusions;
  notes: string;
  scope: string;
};

export function makeEmptyData(): ItineraryData {
  return {
    title: "",
    destination: "",
    template: "City Explorer",
    duration: 3,
    travellers: 2,
    departureCity: "Delhi",
    departureDate: undefined,
    returnDate: undefined,
    stopovers: "Direct",
    days: [],
    totalAmount: 1000,
    paymentPreset: "3-INST",
    installments: [],
    flights: [],
    bookings: [],
    inclusions: {
      flights: true,
      breakfast: true,
      transfers: true,
      sightseeing: true,
      localTaxes: true,
    },
    notes: "All services subject to availability. Rates may vary with season.",
    scope: "Our scope includes accommodation, daily breakfast, mentioned transfers, and sightseeing as per itinerary.",
  };
}

export function calcReturnDate(start?: string, duration?: number) {
  if (!start || !duration) return undefined;
  const d = addDays(new Date(start), Math.max(0, duration - 1));
  return format(d, "yyyy-MM-dd");
}

export function buildDefaultDays(
  destinationKey: keyof typeof destinations,
  startDate: string | undefined,
  duration: number,
  templateKey: keyof typeof templates,
): DayPlan[] {
  const dest: DestinationOptions = destinations[destinationKey];
  const pattern = templates[templateKey]?.dayPattern || [];
  const days: DayPlan[] = [];

  for (let i = 0; i < duration; i++) {
    const pat = pattern[i % pattern.length] || {};
    const date = startDate ? format(addDays(new Date(startDate), i), "yyyy-MM-dd") : "";
    const activities: DayPlan["activities"] = {
      morning: mapTemplateKeyToActivityId(dest, pat.morning),
      afternoon: mapTemplateKeyToActivityId(dest, pat.afternoon),
      evening: mapTemplateKeyToActivityId(dest, pat.evening),
    };

    days.push({
      label: `Day ${i + 1}`,
      date,
      activities,
      transport: destinations[destinationKey].transfers[0],
      hotelId: dest.hotels[0]?.id,
    });
  }
  return days;
}

export function regenerateSuggestions(data: ItineraryData): ItineraryData {
  if (!data.destination) return data;
  const days = buildDefaultDays(
    data.destination as keyof typeof destinations,
    data.departureDate,
    data.duration,
    data.template,
  );
  return { ...data, days };
}

export function applyPaymentPreset(total: number, preset: ItineraryData["paymentPreset"]): Installment[] {
  if (preset === "Custom") return [];
  const ratios = paymentPresets[preset] || [1];
  const names = {
    FULL: ["Full Payment"],
    "2-INST": ["Initial 50%", "Final 50%"],
    "3-INST": ["Initial", "Post Visa", "Final"],
  } as const;

  return ratios.map((r, i) => ({
    name: (names as any)[preset]?.[i] ?? `Installment ${i + 1}`,
    amount: Math.round(total * r),
  }));
}

export function autoAssignHotelsByDay(data: ItineraryData): ItineraryData {
  if (!data.destination) return data;
  const dest = destinations[data.destination];
  const hotels = dest.hotels;
  if (!hotels.length) return data;
  const days = data.days.map((d, i) => ({ ...d, hotelId: hotels[i % hotels.length].id }));
  return { ...data, days };
}

export function computeNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = Math.max(0, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  return diff;
}
