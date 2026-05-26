import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReservations, Reservation } from "@/lib/reservationStorage";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 18, // 6 PM
  slotDuration: 30, // 30 minutes
};

// Generate time slots for a day
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const { start, end, slotDuration } = BUSINESS_HOURS;

  for (let hour = start; hour < end; hour++) {
    for (let minutes = 0; minutes < 60; minutes += slotDuration) {
      const hourStr = hour.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
      slots.push(`${hourStr}:${minutesStr}`);
    }
  }

  return slots;
};

interface TimeSlot {
  time: string;
  isBooked: boolean;
  reservations: Reservation[];
}

const CalendarBookingView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [monthView, setMonthView] = useState<Date>(new Date());
  const reservations = getReservations();

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Get booked times for selected date
  const bookedSlots = useMemo(() => {
    if (!selectedDate) return {};

    const dateStr = formatDateForComparison(selectedDate);
    const booked: { [key: string]: Reservation[] } = {};

    reservations.forEach((res) => {
      const resDateStr = formatDateForComparison(new Date(res.date));
      if (resDateStr === dateStr && res.status !== "cancelled") {
        if (!booked[res.time]) {
          booked[res.time] = [];
        }
        booked[res.time].push(res);
      }
    });

    return booked;
  }, [selectedDate, reservations]);

  // Prepare time slot data
  const slotData: TimeSlot[] = useMemo(() => {
    return timeSlots.map((time) => ({
      time,
      isBooked: !!bookedSlots[time],
      reservations: bookedSlots[time] || [],
    }));
  }, [timeSlots, bookedSlots]);

  const handlePreviousMonth = () => {
    setMonthView(
      new Date(monthView.getFullYear(), monthView.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setMonthView(
      new Date(monthView.getFullYear(), monthView.getMonth() + 1, 1)
    );
  };

  const getDateInfo = (date: Date | undefined) => {
    if (!date) return { dayName: "", dateStr: "" };

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return { dayName, dateStr };
  };

  const { dayName, dateStr } = getDateInfo(selectedDate);

  return (
    <div className="bg-gradient-to-br from-cream-light to-background rounded-2xl p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-3xl text-foreground mb-2">
            Calendar & Availability
          </h2>
          <p className="text-muted-foreground">
            Select a date to view available appointment times
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-border shadow-sm">
              {/* Month/Year Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <h3 className="font-semibold text-foreground">
                  {monthView.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Calendar */}
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={monthView}
                  onMonthChange={setMonthView}
                  disabled={(date) => date < new Date()}
                  className="[&_.DayPickerRootStyles]:p-0"
                />
              </div>
            </Card>
          </div>

          {/* Time Slots Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border shadow-sm h-fit">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl text-foreground">
                  Available Times
                </h3>
                {selectedDate && (
                  <p className="text-muted-foreground mt-1">
                    {dayName}, {dateStr}
                  </p>
                )}
              </div>

              <div className="p-6">
                {selectedDate ? (
                  <div className="space-y-3">
                    {selectedDate.getDay() === 0 ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium text-lg">E diel - Klinika e mbyllur</p>
                        <p className="text-red-500 text-sm mt-1">Ju lutem zgjidhni një datë tjetër</p>
                      </div>
                    ) : (
                    <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-border">
                      <div className="text-center">
                        <div className="text-2xl font-display text-green-600">
                          {slotData.filter((s) => !s.isBooked).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-display text-red-600">
                          {slotData.filter((s) => s.isBooked).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Booked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-display text-foreground">
                          {slotData.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>

                    {/* Time Slots Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {slotData.map((slot) => (
                        <div
                          key={slot.time}
                          className={`p-4 rounded-lg border-2 transition-all cursor-default ${
                            slot.isBooked
                              ? "bg-red-50 border-red-200"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <div className="text-sm font-semibold text-foreground mb-2">
                            {slot.time}
                          </div>
                          <Badge
                            variant={slot.isBooked ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {slot.isBooked ? "Booked" : "Available"}
                          </Badge>

                          {/* Show booked reservation details */}
                          {slot.isBooked && slot.reservations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-200 text-xs space-y-1">
                              {slot.reservations.map((res) => (
                                <div key={res.id} className="text-red-700">
                                  <div className="font-medium">{res.name}</div>
                                  <div className="text-red-600">
                                    {res.phone}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Select a date to view available times</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date for comparison
function formatDateForComparison(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default CalendarBookingView;
