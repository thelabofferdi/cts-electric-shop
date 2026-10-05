export type ShopProduct = {
  _id?: string;
  name: string;
  slug: string;
  eyebrow?: string;
  shortDescription: string;
  description: string;
  imageStorageId?: string;
  imageUrl: string;
  galleryUrls: string[];
  priceCfa: number;
  compareAtPriceCfa?: number;
  depositCfa: number;
  rangeKm: number;
  maxSpeedKmh: number;
  motorPowerW: number;
  chargeHours: number;
  batteryLabel: string;
  colors: string[];
  features: string[];
  availability: "open" | "limited" | "closed";
  groupLabel: string;
  deliveryEstimate: string;
  remainingUnits?: number;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type ShopConfig = {
  enabled: boolean;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsapp: string;
  supportPhone: string;
  depositNotice: string;
};

export type ShopAppointmentConfig = {
  enabled: boolean;
  location: string;
  slotMinutes: number;
  businessHours: Array<{ day: number; label: string; enabled: boolean; start: string; end: string }>;
  appointmentTypes: Array<{ key: string; label: string; enabled: boolean }>;
  whatsappMessageTemplate: string;
};

export type ShopAppointment = {
  _id: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  visitorName: string;
  phone: string;
  email?: string;
  city: string;
  appointmentType: string;
  requestedAt: string;
  reason: string;
  status: "requested" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
};
