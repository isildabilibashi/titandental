interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  createdAt: string;
}

const STORAGE_KEY = "titan_dent_reservations";

export function getReservations(): Reservation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReservation(reservation: Omit<Reservation, "id" | "createdAt">): Reservation {
  const reservations = getReservations();
  const newReservation: Reservation = {
    ...reservation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  reservations.push(newReservation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  return newReservation;
}
