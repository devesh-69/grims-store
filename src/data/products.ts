
import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "p1",
    name: "Ultra Gaming Headset X1",
    short_description: "Immerse yourself in crystal clear audio with our premium noise-cancelling gaming headset with RGB lighting.",
    image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&q=75&fit=crop&w=600",
    category_id: "gaming",
    category: {
      id: "gaming",
      name: "Gaming"
    },
    is_new: true,
    rating: 4.8,
    review_count: 124,
    affiliateUrl: "https://example.com/affiliate/headset-x1"
  },
  {
    id: "p2",
    name: "Ergonomic Mechanical Keyboard",
    short_description: "Professional mechanical keyboard with customizable RGB lighting and premium switches for the ultimate typing experience.",
    image_url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&q=75&fit=crop&w=600",
    category_id: "peripherals",
    category: {
      id: "peripherals",
      name: "Peripherals"
    },
    rating: 4.7,
    review_count: 98,
    affiliateUrl: "https://example.com/affiliate/ergo-keyboard"
  },
  {
    id: "p3",
    name: "Wireless Pro Gaming Mouse",
    short_description: "Ultra-responsive wireless mouse with adjustable DPI settings and programmable buttons for gaming precision.",
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&q=75&fit=crop&w=600",
    category_id: "peripherals",
    category: {
      id: "peripherals",
      name: "Peripherals"
    },
    rating: 4.5,
    review_count: 56,
    affiliateUrl: "https://example.com/affiliate/gaming-mouse"
  },
  {
    id: "p4",
    name: "4K Ultra HD Monitor 32",
    short_description: "Experience stunning visuals with this 32-inch 4K monitor featuring HDR support and gaming-optimized refresh rates.",
    image_url: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&q=75&fit=crop&w=600",
    category_id: "monitors",
    category: {
      id: "monitors",
      name: "Monitors"
    },
    is_new: true,
    rating: 4.9,
    review_count: 42,
    affiliateUrl: "https://example.com/affiliate/4k-monitor"
  },
  {
    id: "p5",
    name: "RGB Gaming Mouse Pad XL",
    short_description: "Extra-large mouse pad with smooth surface and customizable RGB lighting around the edges.",
    image_url: "https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?auto=format&q=75&fit=crop&w=600",
    category_id: "accessories",
    category: {
      id: "accessories",
      name: "Accessories"
    },
    rating: 4.3,
    review_count: 78,
    affiliateUrl: "https://example.com/affiliate/mousepad-xl"
  },
  {
    id: "p6",
    name: "Premium Gaming Chair",
    short_description: "Ergonomic gaming chair with adjustable armrests, reclining function and lumbar support for extended gaming sessions.",
    image_url: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&q=75&fit=crop&w=600",
    category_id: "furniture",
    category: {
      id: "furniture",
      name: "Furniture"
    },
    rating: 4.6,
    review_count: 104,
    affiliateUrl: "https://example.com/affiliate/gaming-chair"
  }
];
