import { format } from "date-fns";
import { destinations } from "@/data/options";
import { ItineraryData } from "@/hooks/useItineraryStore";
import { useState } from "react";

type Props = {
  data: ItineraryData;
  travelerName?: string;
  visaType?: string;
  visaValidity?: string;
  visaProcessingDate?: string;
};

export default function PdfLayout({
  data,
  travelerName = "Guest",
  visaType = "",
  visaValidity = "",
  visaProcessingDate = "",
}: Props) {
  const dest = data.destination ? destinations[data.destination] : undefined;
  const fmt = (d?: string) => (d ? format(new Date(d), "dd/MM/yyyy") : "");

  // Footer component
  const Footer = () => (
    <div className="flex justify-between items-end text-xs text-slate-700 mt-8 pt-6 border-t">
      <div>
        <div className="font-semibold mb-1">Vigovia Tech Pvt. Ltd</div>
        <div className="text-slate-600">
          Registered Office: Hd-109 Cinnabar Hills,
        </div>
        <div className="text-slate-600">
          Links Business Park, Karnataka, India.
        </div>
        <div className="text-slate-600 mt-1">Phone: +91-9504061112</div>
        <div className="text-slate-600">Email ID: Utkarsh@Vigovia.Com</div>
        <div className="text-slate-600">CIN: U79110KA2024PTC191890</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-brand-900 text-sm">vigovia</div>
        <div className="text-xs text-slate-600">PLAN.PACK.GO</div>
      </div>
    </div>
  );

  const durationText = `${data.duration} Days ${Math.max(0, data.duration - 1)} Nights`;

  return (
    <div className="w-[794px] mx-auto text-slate-800 font-sans">
      {/* PAGE 1: Header + Overview + Day 1 */}
      <div data-pdf-page className="w-[794px] h-[1123px] bg-white px-8 py-8">
        {/* Header with Gradient */}
        <div className="mb-8 text-center">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            vigovia
          </div>
          <div className="text-xs text-slate-600">PLAN.PACK.GO</div>
        </div>

        {/* Gradient Box */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-800 rounded-3xl text-white p-6 mb-8 text-center">
          <div className="text-2xl font-semibold mb-1">Hi, {travelerName}!</div>
          <div className="text-3xl font-bold mb-2">
            {data.destination || "Custom"} Itinerary
          </div>
          <div className="text-lg mb-3">{durationText}</div>
          <div className="flex justify-center gap-2 text-2xl">
            ✈️ 🏨 ✓ 🚗 🧳
          </div>
        </div>

        {/* Trip Overview */}
        <div className="border-2 border-slate-300 rounded-2xl p-5 mb-8 bg-white">
          <div className="grid grid-cols-5 gap-3 text-center text-sm">
            <div>
              <div className="font-bold text-slate-800">Departure From :</div>
              <div className="text-slate-700 mt-1">{data.departureCity}</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Departure :</div>
              <div className="text-slate-700 mt-1">
                {fmt(data.departureDate)}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Arrival :</div>
              <div className="text-slate-700 mt-1">{fmt(data.returnDate)}</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Destination :</div>
              <div className="text-slate-700 mt-1">
                {data.destination || "—"}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-800">
                No. Of Travellers :
              </div>
              <div className="text-slate-700 mt-1">{data.travellers}</div>
            </div>
          </div>
        </div>

        {/* First Day Card */}
        {data.days.length > 0 && (
          <div className="flex gap-4 mb-6">
            {/* Left: Day Label */}
            <div className="shrink-0">
              <div className="bg-brand-900 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-lg text-center px-2">
                Day 1
              </div>
            </div>

            {/* Image placeholder */}
            <div className="shrink-0">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-500">
                Image
              </div>
            </div>

            {/* Right: Itinerary */}
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800 mb-1">
                {data.days[0].date
                  ? format(new Date(data.days[0].date), "dd MMM yyyy")
                  : ""}
              </div>
              <div className="text-sm font-bold text-slate-900 mb-3">
                {data.days[0].label || "Day 1"}
              </div>

              {/* Timeline */}
              <div className="space-y-2 text-xs">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow"></div>
                    <div className="w-0.5 h-8 bg-brand-300 mt-1"></div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Morning</div>
                    <div className="text-slate-600">
                      Arrive in Singapore. Transfer from airport to hotel.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow"></div>
                    <div className="w-0.5 h-8 bg-brand-300 mt-1"></div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Afternoon</div>
                    <div className="text-slate-600">Check into your hotel.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow"></div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Evening</div>
                    <div className="text-slate-600">
                      Explore gardens by the bay.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <hr className="my-6" />

        {/* Second Day (if exists) */}
        {data.days.length > 1 && (
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="bg-brand-900 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-lg text-center px-2">
                Day 2
              </div>
            </div>
            <div className="shrink-0">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-500">
                Image
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800 mb-1">
                {data.days[1].date
                  ? format(new Date(data.days[1].date), "dd MMM yyyy")
                  : ""}
              </div>
              <div className="text-sm font-bold text-slate-900">
                {data.days[1].label || "Day 2"}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>

      {/* PAGE 2: Flights + Hotels */}
      <div data-pdf-page className="w-[794px] h-[1123px] bg-white px-8 py-8">
        {/* Flight Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Flight <span className="text-brand-800">Summary</span>
          </h2>
          <div className="space-y-3">
            {data.flights.map((f) => (
              <div
                key={f.id}
                className="border-2 border-brand-200 rounded-lg p-4 bg-brand-50 flex gap-4"
              >
                <div className="shrink-0 bg-brand-100 border-2 border-brand-300 rounded-lg px-3 py-2 text-center min-w-24 text-xs font-bold text-brand-900">
                  {f.date ? format(new Date(f.date), "ddd dd MMM") : "Date"}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-semibold text-slate-800">
                    Fly {f.airline} ({f.time}) From {f.from} To {f.to}.
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-600 mt-3">
            Note: All Flights Include Meals, Seat Choice (Excluding XL), And
            20kg/25kg Checked Baggage.
          </div>
        </div>

        {/* Hotel Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Hotel <span className="text-brand-800">Bookings</span>
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg">City</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Nights</th>
                <th className="p-3 text-left rounded-tr-lg">Hotel Name</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.length > 0 ? (
                data.bookings.map((b, i) => (
                  <tr key={b.id} className="bg-brand-100 border-b">
                    <td className="p-3">{b.city}</td>
                    <td className="p-3">{fmt(b.checkIn)}</td>
                    <td className="p-3">{fmt(b.checkOut)}</td>
                    <td className="p-3">{b.nights}</td>
                    <td className="p-3">
                      {dest?.hotels.find((h) => h.id === b.hotelId)?.name ||
                        "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-brand-100">
                  <td colSpan={5} className="p-3 text-center text-slate-600">
                    No bookings added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-xs text-slate-700 mt-3 space-y-1">
            <div>
              1. All Hotels Are Tentative And Can Be Replaced With Similar.
            </div>
            <div>2. Breakfast Included For All Hotel Stays.</div>
            <div>3. All Hotels Will Be 4* And Above Category.</div>
            <div>
              4. A Maximum Occupancy Of 2 People/Room Is Allowed In Most Hotels.
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* PAGE 3: Important Notes + Scope + Inclusion */}
      <div data-pdf-page className="w-[794px] h-[1123px] bg-white px-8 py-8">
        {/* Important Notes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Important <span className="text-brand-800">Notes</span>
          </h2>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg w-1/3">Point</th>
                <th className="p-3 text-left rounded-tr-lg">Details</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  point: "Airlines Standard Policy",
                  detail:
                    "In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.",
                },
                {
                  point: "Flight/Hotel Cancellation",
                  detail:
                    "In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.",
                },
                {
                  point: "Trip Insurance",
                  detail:
                    "In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.",
                },
                {
                  point: "Hotel Check-In & Check Out",
                  detail:
                    "In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.",
                },
                {
                  point: "Visa Rejection",
                  detail:
                    "In Case Of Visa Rejection, Visa Fees Or Any Other Non Cancellable Component Cannot Be Reimbursed At Any Cost.",
                },
              ].map((row, i) => (
                <tr key={i} className="bg-brand-100 border-b">
                  <td className="p-3 font-semibold text-slate-800">
                    {row.point}
                  </td>
                  <td className="p-3 text-slate-700">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scope Of Service */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Scope Of <span className="text-brand-800">Service</span>
          </h2>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg w-1/3">Service</th>
                <th className="p-3 text-left rounded-tr-lg">Details</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  svc: "Flight Tickets And Hotel Vouchers",
                  detail: "Delivered 3 Days Post Full Payment",
                },
                {
                  svc: "Web Check-In",
                  detail: "Boarding Pass Delivery Via Email/WhatsApp",
                },
                {
                  svc: "Support",
                  detail: "Chat Support - Response Time: 4 Hours",
                },
                { svc: "Cancellation Support", detail: "Provided" },
                { svc: "Trip Support", detail: "Response Time: 5 Minutes" },
              ].map((row, i) => (
                <tr key={i} className="bg-brand-100 border-b">
                  <td className="p-3 font-semibold text-slate-800">
                    {row.svc}
                  </td>
                  <td className="p-3 text-slate-700">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inclusion Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Inclusion <span className="text-brand-800">Summary</span>
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg">Category</th>
                <th className="p-3 text-left">Count</th>
                <th className="p-3 text-left">Details</th>
                <th className="p-3 text-left rounded-tr-lg">
                  Status / Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  cat: "Flight",
                  count: "2",
                  detail: "All Flights Mentioned",
                  status: "Awaiting Confirmation",
                },
                {
                  cat: "Tourist Tax",
                  count: "2",
                  detail:
                    "Yotel (Singapore), Oakwood (Sydney), Mercure (Cairns), Novotel (Gold Coast), Holiday Inn (Melbourne)",
                  status: "Awaiting Confirmation",
                },
                {
                  cat: "Hotel",
                  count: "2",
                  detail:
                    "Airport To Hotel - Hotel To Attractions - Day Trips If Any",
                  status: "Included",
                },
              ].map((row, i) => (
                <tr key={i} className="bg-brand-100 border-b">
                  <td className="p-3 font-semibold text-slate-800">
                    {row.cat}
                  </td>
                  <td className="p-3 text-center">{row.count}</td>
                  <td className="p-3 text-slate-700">{row.detail}</td>
                  <td className="p-3 text-slate-700">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-slate-700 mt-3">
            Transfer Policy(Refundable Upon Claim): If Any Transfer Is Delayed
            Beyond 15 Minutes, Customers May Book An App-Based Or Radio Taxi And
            Claim A Refund For That Specific Leg.
          </div>
        </div>

        <Footer />
      </div>

      {/* PAGE 4: Activity Table */}
      <div data-pdf-page className="w-[794px] h-[1123px] bg-white px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Activity <span className="text-brand-800">Table</span>
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg">City</th>
                <th className="p-3 text-left">Activity</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left rounded-tr-lg">Time Required</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 13 }).map((_, i) => (
                <tr key={i} className="bg-brand-100 border-b">
                  <td className="p-3">Rio De Janeiro</td>
                  <td className="p-3">Sydney Harbour Cruise & Taronga Zoo</td>
                  <td className="p-3">Nature/Sightseeing</td>
                  <td className="p-3">2-3 Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Terms and <span className="text-brand-800">Conditions</span>
          </h2>
          <a href="#" className="text-blue-600 underline text-sm">
            View all terms and conditions
          </a>
        </div>

        <Footer />
      </div>

      {/* PAGE 5: Payment Plan + Visa Details + CTA */}
      <div data-pdf-page className="w-[794px] h-[1123px] bg-white px-8 py-8">
        {/* Payment Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Payment <span className="text-brand-800">Plan</span>
          </h2>

          {/* Total Amount & TCS */}
          <div className="space-y-3 mb-4">
            <div className="border-2 border-brand-300 rounded-lg p-3 flex gap-4 items-center bg-brand-50">
              <div className="bg-brand-200 border-2 border-brand-300 rounded-lg px-3 py-2 font-bold text-brand-900 text-sm w-32 text-center">
                Total Amount
              </div>
              <div className="text-sm font-semibold text-slate-800">
                ₹ {data.totalAmount.toLocaleString()} For {data.travellers} Pax
                (Inclusive Of GST)
              </div>
            </div>
            <div className="border-2 border-brand-300 rounded-lg p-3 flex gap-4 items-center bg-brand-50">
              <div className="bg-brand-200 border-2 border-brand-300 rounded-lg px-3 py-2 font-bold text-brand-900 text-sm w-32 text-center">
                TCS
              </div>
              <div className="text-sm font-semibold text-slate-800">
                Not Collected
              </div>
            </div>
          </div>

          {/* Installments Table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="p-3 text-left rounded-tl-lg">Installment</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left rounded-tr-lg">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {data.installments.map((ins, i) => (
                <tr key={i} className="bg-brand-100 border-b">
                  <td className="p-3 font-semibold">{ins.name}</td>
                  <td className="p-3">₹{ins.amount.toLocaleString()}</td>
                  <td className="p-3">{fmt(ins.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visa Details */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Visa <span className="text-brand-800">Details</span>
          </h2>
          <div className="border-2 border-slate-300 rounded-2xl p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-bold text-slate-800">Visa Type :</div>
              <div className="text-slate-700 mt-1">{visaType || "123456"}</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Validity :</div>
              <div className="text-slate-700 mt-1">
                {visaValidity || "123456"}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Processing Date :</div>
              <div className="text-slate-700 mt-1">
                {visaProcessingDate || "123456"}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12">
          <div className="text-4xl font-bold text-brand-900 mb-6">
            PLAN.PACK.GO!
          </div>
          <button className="bg-brand-800 text-white px-12 py-3 rounded-full font-bold text-lg hover:bg-brand-900">
            Book Now
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}
