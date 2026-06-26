export type Activity = {
  id: string;
  title: string;
  type?: string;
  duration?: string;
  description?: string;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  thumbnailUrl?: string;
  addressShort?: string;
};

export type DestinationOptions = {
  activities: Activity[];
  hotels: Hotel[];
  airlines: string[];
  transfers: string[];
};

export type DestinationsMap = Record<string, DestinationOptions>;

export type TemplateDayPattern = {
  morning?: string;
  afternoon?: string;
  evening?: string;
};

export type TemplatesMap = Record<string, { dayPattern: TemplateDayPattern[]; description?: string }>;

export type PaymentPresets = {
  [key: string]: number[];
};

export type CountryCity = { country: string; city: string };

export const departureCities: CountryCity[] = [
  { country: "India", city: "Delhi" },
  { country: "India", city: "Mumbai" },
  { country: "India", city: "Bengaluru" },
  { country: "India", city: "Kolkata" },
  { country: "India", city: "Chennai" },
  { country: "UAE", city: "Dubai" },
  { country: "Singapore", city: "Singapore" },
  { country: "Thailand", city: "Bangkok" },
  { country: "Japan", city: "Tokyo" },
  { country: "USA", city: "New York" },
  { country: "USA", city: "San Francisco" },
  { country: "UK", city: "London" },
  { country: "France", city: "Paris" },
];

export const destinations: DestinationsMap = {
  Singapore: {
    activities: [
      { id: "mbs", title: "Marina Bay Sands Visit", type: "Sightseeing", duration: "2-3 Hours", description: "Explore the iconic Marina Bay Sands with observation deck views." },
      { id: "gardens", title: "Gardens by the Bay", type: "Nature", duration: "2-4 Hours", description: "Visit the Supertree Grove and Cloud Forest biodomes." },
      { id: "universal", title: "Universal Studios", type: "Theme Park", duration: "4-6 Hours", description: "Thrilling rides and shows at Resorts World Sentosa." },
      { id: "city-walk", title: "City Walking Tour", type: "Leisure", duration: "2-3 Hours", description: "Leisurely walk across Merlion Park and Marina promenade." },
      { id: "river-cruise", title: "River Cruise", type: "Leisure", duration: "1 Hour", description: "Evening cruise along the Singapore River." },
      { id: "night-safari", title: "Night Safari", type: "Wildlife", duration: "3-4 Hours", description: "World's first nocturnal zoo experience." },
      { id: "sentosa", title: "Sentosa Island", type: "Beach", duration: "Half Day", description: "Beach time, SEA Aquarium, Madam Tussauds options." },
      { id: "shopping", title: "Shopping on Orchard", type: "Leisure", duration: "2-3 Hours", description: "Retail therapy along Orchard Road." },
      { id: "museum", title: "Museum Visit", type: "Culture", duration: "2 Hours", description: "ArtScience Museum or National Museum visit." },
      { id: "free", title: "Free Time", type: "Leisure", duration: "Flexible", description: "Relax or explore at your own pace." },
    ],
    hotels: [
      { id: "sg_h1", name: "Marina Bay Hotel", city: "Singapore", thumbnailUrl: "/placeholder.svg", addressShort: "Marina Bay" },
      { id: "sg_h2", name: "Orchard Stay", city: "Singapore", thumbnailUrl: "/placeholder.svg", addressShort: "Orchard Road" },
      { id: "sg_h3", name: "City Centre Suites", city: "Singapore", thumbnailUrl: "/placeholder.svg", addressShort: "City Hall" },
      { id: "sg_h4", name: "Seaside Resort", city: "Singapore", thumbnailUrl: "/placeholder.svg", addressShort: "Sentosa" },
    ],
    airlines: ["Air India", "Singapore Airlines", "IndiGo", "Vistara"],
    transfers: [
      "Airport Transfer (Shared)",
      "Airport Transfer (Private)",
      "Private Car",
      "Shared Coach",
      "Train",
      "No Transfer",
    ],
  },
  Dubai: {
    activities: [
      { id: "burj", title: "Burj Khalifa At The Top", type: "Sightseeing", duration: "2 Hours" },
      { id: "desert", title: "Desert Safari", type: "Adventure", duration: "Half Day" },
      { id: "marina", title: "Dubai Marina Dhow Cruise", type: "Leisure", duration: "2 Hours" },
      { id: "frame", title: "Dubai Frame", type: "Sightseeing", duration: "1-2 Hours" },
      { id: "shopping", title: "Dubai Mall Shopping", type: "Leisure", duration: "2-3 Hours" },
      { id: "free", title: "Free Time" },
    ],
    hotels: [
      { id: "db_h1", name: "Downtown Luxury Hotel", city: "Dubai", thumbnailUrl: "/placeholder.svg", addressShort: "Downtown" },
      { id: "db_h2", name: "Marina View", city: "Dubai", thumbnailUrl: "/placeholder.svg", addressShort: "Dubai Marina" },
      { id: "db_h3", name: "Desert Resort", city: "Dubai", thumbnailUrl: "/placeholder.svg", addressShort: "Outskirts" },
    ],
    airlines: ["Emirates", "Etihad", "Air India"],
    transfers: ["Airport Transfer (Private)", "Private Car", "Shared Coach", "Metro", "No Transfer"],
  },
  Bangkok: {
    activities: [
      { id: "temples", title: "Grand Palace & Temples", type: "Culture", duration: "Half Day" },
      { id: "floating", title: "Floating Market", type: "Culture", duration: "Half Day" },
      { id: "safari", title: "Safari World", type: "Wildlife", duration: "Full Day" },
      { id: "shopping", title: "MBK/Platinum Shopping", type: "Leisure", duration: "2-3 Hours" },
      { id: "free", title: "Free Time" },
    ],
    hotels: [
      { id: "bk_h1", name: "Sukhumvit Suites", city: "Bangkok", thumbnailUrl: "/placeholder.svg", addressShort: "Sukhumvit" },
      { id: "bk_h2", name: "Riverside Hotel", city: "Bangkok", thumbnailUrl: "/placeholder.svg", addressShort: "Riverside" },
    ],
    airlines: ["Thai Airways", "AirAsia", "VietJet", "IndiGo"],
    transfers: ["Airport Transfer (Shared)", "Airport Transfer (Private)", "Private Car", "BTS Skytrain", "No Transfer"],
  },
  London: {
    activities: [
      { id: "l_eye", title: "London Eye", type: "Sightseeing", duration: "1-2 Hours" },
      { id: "buckingham", title: "Buckingham Palace", type: "Culture", duration: "2 Hours" },
      { id: "tower", title: "Tower of London", type: "History", duration: "3 Hours" },
      { id: "thames", title: "Thames River Cruise", type: "Leisure", duration: "1-2 Hours" },
      { id: "free", title: "Free Time" },
    ],
    hotels: [
      { id: "ld_h1", name: "Westminster Inn", city: "London", thumbnailUrl: "/placeholder.svg", addressShort: "Westminster" },
      { id: "ld_h2", name: "Kensington Suites", city: "London", thumbnailUrl: "/placeholder.svg", addressShort: "Kensington" },
    ],
    airlines: ["British Airways", "Virgin Atlantic", "Vistara"],
    transfers: ["Heathrow Express", "Private Car", "Underground", "No Transfer"],
  },
  Tokyo: {
    activities: [
      { id: "skytree", title: "Tokyo Skytree", type: "Sightseeing", duration: "2 Hours" },
      { id: "asakusa", title: "Asakusa & Senso-ji", type: "Culture", duration: "3 Hours" },
      { id: "teamlab", title: "teamLab Planets", type: "Art", duration: "2 Hours" },
      { id: "disney", title: "Tokyo Disney Resort", type: "Theme Park", duration: "Full Day" },
      { id: "free", title: "Free Time" },
    ],
    hotels: [
      { id: "tk_h1", name: "Shinjuku Hotel", city: "Tokyo", thumbnailUrl: "/placeholder.svg", addressShort: "Shinjuku" },
      { id: "tk_h2", name: "Ginza Stay", city: "Tokyo", thumbnailUrl: "/placeholder.svg", addressShort: "Ginza" },
    ],
    airlines: ["JAL", "ANA", "Air India", "Singapore Airlines"],
    transfers: ["Airport Limousine Bus", "JR Rail", "Private Car", "No Transfer"],
  },
  "New York": {
    activities: [
      { id: "liberty", title: "Statue of Liberty", type: "Sightseeing", duration: "3 Hours" },
      { id: "central", title: "Central Park Walk", type: "Leisure", duration: "2 Hours" },
      { id: "momA", title: "MoMA Museum", type: "Art", duration: "2-3 Hours" },
      { id: "times", title: "Times Square", type: "Leisure", duration: "2 Hours" },
      { id: "free", title: "Free Time" },
    ],
    hotels: [
      { id: "ny_h1", name: "Midtown Hotel", city: "New York", thumbnailUrl: "/placeholder.svg", addressShort: "Midtown" },
      { id: "ny_h2", name: "SoHo Boutique", city: "New York", thumbnailUrl: "/placeholder.svg", addressShort: "SoHo" },
    ],
    airlines: ["United", "Delta", "American Airlines", "Air India"],
    transfers: ["Private Car", "Metro", "Yellow Taxi", "No Transfer"],
  },
};

export const templates: TemplatesMap = {
  "City Explorer": {
    dayPattern: [
      { morning: "arrival", afternoon: "city-walk", evening: "river-cruise" },
      { morning: "gardens", afternoon: "mbs", evening: "shopping" },
      { morning: "universal", afternoon: "sentosa", evening: "free" },
    ],
    description: "Balanced highlights with leisure and iconic attractions.",
  },
  "Relax & Resort": {
    dayPattern: [
      { morning: "arrival", afternoon: "free", evening: "river-cruise" },
      { morning: "sentosa", afternoon: "free", evening: "shopping" },
      { morning: "gardens", afternoon: "mbs", evening: "free" },
    ],
  },
  "Family Fun": {
    dayPattern: [
      { morning: "arrival", afternoon: "city-walk", evening: "free" },
      { morning: "universal", afternoon: "sentosa", evening: "shopping" },
      { morning: "gardens", afternoon: "mbs", evening: "free" },
    ],
  },
  Adventure: {
    dayPattern: [
      { morning: "city-walk", afternoon: "gardens", evening: "night-safari" },
      { morning: "sentosa", afternoon: "universal", evening: "free" },
    ],
  },
};

export const paymentPresets: PaymentPresets = {
  FULL: [1],
  "2-INST": [0.5, 0.5],
  "3-INST": [0.4, 0.3, 0.3],
};

export const defaultTransports = [
  "Airport Transfer",
  "Private Car",
  "Shared Coach",
  "Train",
  "No Transfer",
];

export function suggestTripTitles(destination: string, travellers: number) {
  const base = destination ? `${destination} Itinerary` : "Custom Itinerary";
  const family = travellers >= 4 ? `${destination} Family Trip` : undefined;
  const adventure = destination ? `${destination} City Explorer` : undefined;
  return [base, family, adventure].filter(Boolean) as string[];
}

export function mapTemplateKeyToActivityId(dest: DestinationOptions, key?: string): string | undefined {
  if (!key) return undefined;
  const byId = (id: string) => dest.activities.find((a) => a.id === id)?.id;
  switch (key) {
    case "arrival":
      return byId("city-walk") || dest.activities[0]?.id;
    case "city-walk":
      return byId("city-walk");
    case "river-cruise":
      return byId("river-cruise");
    case "gardens":
      return byId("gardens");
    case "mbs":
      return byId("mbs");
    case "universal":
      return byId("universal");
    case "sentosa":
      return byId("sentosa");
    case "night-safari":
      return byId("night-safari");
    case "shopping":
      return byId("shopping");
    case "free":
      return byId("free");
    default:
      return dest.activities[0]?.id;
  }
}
