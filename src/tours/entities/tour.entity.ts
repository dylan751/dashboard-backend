export class Tour {
  id: number;
  title: string;
  duration?: string;
  startTime?: string;
  rating?: number;
  hotel?: string;
  price: number;
  vehicle: string;
  type: string; // Should be ENUM
  numberOfPeople?: string; // Should be numberUserRole
  description?: string;
  numberOfBooking?: number;
  image?: string;
  isTrending?: boolean;
}
