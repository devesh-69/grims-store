
import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "p1",
    name: "Ultra Gaming Headset X1",
    description: "Immerse yourself in crystal clear audio with our premium noise-cancelling gaming headset with RGB lighting.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&q=75&fit=crop&w=600",
    category: "Gaming",
    isNew: true,
    rating: 4.8,
    reviewCount: 124,
    affiliateUrl: "https://example.com/affiliate/headset-x1"
  },
  {
    id: "p2",
    name: "Ergonomic Mechanical Keyboard",
    description: "Professional mechanical keyboard with customizable RGB lighting and premium switches for the ultimate typing experience.",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&q=75&fit=crop&w=600",
    category: "Peripherals",
    rating: 4.7,
    reviewCount: 98,
    affiliateUrl: "https://example.com/affiliate/ergo-keyboard"
  },
  {
    id: "p3",
    name: "Wireless Pro Gaming Mouse",
    description: "Ultra-responsive wireless mouse with adjustable DPI settings and programmable buttons for gaming precision.",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&q=75&fit=crop&w=600",
    category: "Peripherals",
    rating: 4.5,
    reviewCount: 56,
    affiliateUrl: "https://example.com/affiliate/gaming-mouse"
  },
  {
    id: "p4",
    name: "4K Ultra HD Monitor 32",
    description: "Experience stunning visuals with this 32-inch 4K monitor featuring HDR support and gaming-optimized refresh rates.",
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&q=75&fit=crop&w=600",
    category: "Monitors",
    isNew: true,
    rating: 4.9,
    reviewCount: 42,
    affiliateUrl: "https://example.com/affiliate/4k-monitor"
  },
  {
    id: "p5",
    name: "RGB Gaming Mouse Pad XL",
    description: "Extra-large mouse pad with smooth surface and customizable RGB lighting around the edges.",
    image: "https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?auto=format&q=75&fit=crop&w=600",
    category: "Accessories",
    rating: 4.3,
    reviewCount: 78,
    affiliateUrl: "https://example.com/affiliate/mousepad-xl"
  },
  {
    id: "p6",
    name: "Premium Gaming Chair",
    description: "Ergonomic gaming chair with adjustable armrests, reclining function and lumbar support for extended gaming sessions.",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&q=75&fit=crop&w=600",
    category: "Furniture",
    rating: 4.6,
    reviewCount: 104,
    affiliateUrl: "https://example.com/affiliate/gaming-chair"
  }
];
