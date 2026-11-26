export type UserRole = "admin" | "customer";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  displayOrder: number;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  location: string;
  captureDate: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  width?: number;
  height?: number;
  cameraSpec?: string;
  createdAt: string;
}

export type BookingStatus =
  | "Pending"
  | "Contacted"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string;
  location: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  message: string;
  rating: number;
  customerPhotoUrl?: string;
  serviceType?: string;
  approved: boolean;
  createdAt: string;
}

export interface StoryGalleryFrame {
  url: string;
  caption?: string;
  aspect?: "landscape" | "portrait" | "square";
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  content: string;
  location?: string;
  captureDate?: string;
  galleryImages?: StoryGalleryFrame[];
  published: boolean;
  createdAt: string;
}

export interface StudioService {
  id: string;
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  pricingNote?: string;
  startingPrice?: string;
  deliverables?: string[];
}

export interface SiteSettings {
  id: string;
  brandName: string;
  tagline: string;
  supportingText: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
  photographerName: string;
  aboutHeadline: string;
  aboutBio: string;
  email: string;
  phone: string;
  studioAddress: string;
  instagramUrl: string;
  facebookUrl: string;
  services: StudioService[];
  updatedAt: string;
}

export interface DashboardOverview {
  totalPhotographs: number;
  publishedPhotographs: number;
  totalCategories: number;
  totalBookings: number;
  pendingBookings: number;
  publishedStories: number;
  totalStories: number;
  pendingTestimonials: number;
  approvedTestimonials: number;
}

