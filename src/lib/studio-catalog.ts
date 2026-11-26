import type {
  Category,
  GalleryImage,
  SiteSettings,
  Story,
  StudioService,
} from "@/types";

export const DEFAULT_SERVICES: StudioService[] = [
  {
    id: "service-wedding",
    title: "Wedding Photography",
    slug: "wedding-photography",
    categorySlug: "wedding",
    description:
      "Multi-day editorial destination coverage capturing unguarded emotion, architectural atmosphere, and heirloom portraiture with quiet presence.",
    deliverables: [
      "Full-day or multi-day editorial coverage",
      "Curated archival online gallery & museum-grade print curation",
      "Pre-event location & lighting consultation",
    ],
  },
  {
    id: "service-portrait",
    title: "Portrait Photography",
    slug: "portrait-photography",
    categorySlug: "portrait",
    description:
      "Sculpted studio and environmental portraiture shaped by chiaroscuro lighting, authentic character, and medium-format tonal depth.",
    deliverables: [
      "Bespoke studio or architectural location session",
      "Art-directed lighting & styling guidance",
      "Hand-retouched archival digital masters",
    ],
  },
  {
    id: "service-events",
    title: "Event Photography",
    slug: "event-photography",
    categorySlug: "events",
    description:
      "Discreet, cinematic documentation of cultural galas, private exhibitions, symphony evenings, and milestone gatherings.",
    deliverables: [
      "Same-evening press highlight selects available",
      "Full documentary & VIP portrait coverage",
      "Color-graded editorial archive",
    ],
  },
  {
    id: "service-travel",
    title: "Travel Photography",
    slug: "travel-photography",
    categorySlug: "travel",
    description:
      "Atmospheric visual essays commissioned for hospitality houses, cultural publications, and experiential destinations worldwide.",
    deliverables: [
      "Location scouting & golden-hour sequencing",
      "Editorial storytelling & environmental portraiture",
      "Commercial print & digital licensing options",
    ],
  },
  {
    id: "service-fashion",
    title: "Fashion Photography",
    slug: "fashion-photography",
    categorySlug: "fashion",
    description:
      "Campaign lookbooks and editorial studies balancing tailored movement, tactile fabrics, and sculptural shadow play.",
    deliverables: [
      "Creative direction & storyboard development",
      "Studio or architectural location production",
      "High-resolution campaign & editorial plates",
    ],
  },
  {
    id: "service-product",
    title: "Product Photography",
    slug: "product-photography",
    categorySlug: "product",
    description:
      "Precision still-life compositions for horology, fragrance, fine jewelry, and luxury object houses on natural stone and dark glass.",
    deliverables: [
      "Macro optical focus-stacking & specular control",
      "Custom material & surface styling",
      "Print, billboard & e-commerce master exports",
    ],
  },
  {
    id: "service-sessions",
    title: "Professional Photography Sessions",
    slug: "professional-sessions",
    categorySlug: "portrait",
    description:
      "Tailored executive portraits, creative director profiles, and private artist sittings crafted for enduring editorial distinction.",
    deliverables: [
      "Tethered live review during session",
      "Wardrobe & composition consultation",
      "Immediate priority delivery for press & publications",
    ],
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "main",
  brandName: "MJ PHOTOGRAPHY",
  tagline: "EVERY FRAME TELLS A STORY.",
  supportingText: "Capturing moments. Creating memories. Preserving emotions.",
  heroImageUrl: "",
  aboutImageUrl: "",
  photographerName: "MJ Studio",
  aboutHeadline: "BEHIND EVERY LENS, THERE IS A STORY.",
  aboutBio:
    "Founded on the belief that enduring photographs are sculpted from patience, shadow, and human presence, MJ PHOTOGRAPHY bridges classic medium-format cinema with contemporary fine-art portraiture. Every commission is approached like a quiet motion picture—observing fleeting light, honest gestures, and architectural stillness so each frame resonates decades from today.",
  email: "studio@mjphotography.art",
  phone: "+1 (212) 555-0194",
  studioAddress: "Atelier District, New York & Worldwide Commissions",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  services: DEFAULT_SERVICES,
  updatedAt: "2026-01-15T00:00:00.000Z",
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-wedding",
    name: "Wedding Photography",
    slug: "wedding",
    description:
      "Heirloom destination celebrations, quiet vows, and luminous twilight portraits framed with cinematic intimacy.",
    coverImage: "",
    displayOrder: 1,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "cat-portrait",
    name: "Portrait Photography",
    slug: "portrait",
    description:
      "Sculptural chiaroscuro studies and deeply human character portraits crafted in natural and studio light.",
    coverImage: "",
    displayOrder: 2,
    createdAt: "2026-01-10T10:01:00.000Z",
  },
  {
    id: "cat-nature",
    name: "Nature Photography",
    slug: "nature",
    description:
      "Mist-veiled ancient forests, quiet botanical geometry, and primal light breaking across untamed wilderness.",
    coverImage: "",
    displayOrder: 3,
    createdAt: "2026-01-10T10:02:00.000Z",
  },
  {
    id: "cat-landscape",
    name: "Landscape Photography",
    slug: "landscape",
    description:
      "Monolithic horizons, volcanic shores, and long-exposure studies where earth, tide, and dusk converge.",
    coverImage: "",
    displayOrder: 4,
    createdAt: "2026-01-10T10:03:00.000Z",
  },
  {
    id: "cat-travel",
    name: "Travel Photography",
    slug: "travel",
    description:
      "Visual dispatches from historic medinas, mountain passes, and lantern-lit passages across continents.",
    coverImage: "",
    displayOrder: 5,
    createdAt: "2026-01-10T10:04:00.000Z",
  },
  {
    id: "cat-fashion",
    name: "Fashion Photography",
    slug: "fashion",
    description:
      "Architectural couture editorials defined by dramatic drapery, crisp silhouette, and directional light.",
    coverImage: "",
    displayOrder: 6,
    createdAt: "2026-01-10T10:05:00.000Z",
  },
  {
    id: "cat-events",
    name: "Events Photography",
    slug: "events",
    description:
      "Black-tie galas, private premieres, and cultural performances documented with unobtrusive precision.",
    coverImage: "",
    displayOrder: 7,
    createdAt: "2026-01-10T10:06:00.000Z",
  },
  {
    id: "cat-street",
    name: "Street Photography",
    slug: "street",
    description:
      "Nocturnal rain reflections, fleeting solitude, and poetic human geometry on metropolitan boulevards.",
    coverImage: "",
    displayOrder: 8,
    createdAt: "2026-01-10T10:07:00.000Z",
  },
  {
    id: "cat-product",
    name: "Product Photography",
    slug: "product",
    description:
      "Tactile still-life artistry for fine horology, artisanal glass, and sculptural luxury objects.",
    coverImage: "",
    displayOrder: 9,
    createdAt: "2026-01-10T10:08:00.000Z",
  },
  {
    id: "cat-wildlife",
    name: "Wildlife Photography",
    slug: "wildlife",
    description:
      "Patient long-lens encounters honoring wild majesty in dawn haze and untouched golden savannahs.",
    coverImage: "",
    displayOrder: 10,
    createdAt: "2026-01-10T10:09:00.000Z",
  },
];

// Empty by default: populated strictly from photographer's own uploads in Firebase
export const INITIAL_GALLERY_IMAGES: GalleryImage[] = [];

// Empty by default: populated strictly from photographer's published stories in Firebase
export const INITIAL_STORIES: Story[] = [];
