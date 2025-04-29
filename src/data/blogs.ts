
import { Blog } from "@/types/blog";

export const blogs: Blog[] = [
  {
    id: "b1",
    title: "Top 10 Gaming Peripherals for Competitive Players",
    excerpt: "Discover the essential gaming gear that professional esports athletes use to gain a competitive edge.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&q=75&fit=crop&w=600",
    date: "2023-11-15",
    author: {
      id: "a1",
      name: "Alex Morgan",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    category: "Gaming"
  },
  {
    id: "b2",
    title: "Mechanical vs Membrane Keyboards: Which Is Right For You?",
    excerpt: "A detailed comparison of keyboard technologies to help you choose the perfect typing experience for work or play.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    coverImage: "https://images.unsplash.com/photo-1595044778792-33f4aeece1d7?auto=format&q=75&fit=crop&w=600",
    date: "2023-10-28",
    author: {
      id: "a2",
      name: "Jessica Chen",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    category: "Hardware"
  },
  {
    id: "b3",
    title: "How to Set Up the Ultimate Streaming Station",
    excerpt: "Everything you need to know about creating a professional streaming setup without breaking the bank.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    coverImage: "https://images.unsplash.com/photo-1603481546239-53dffee3c0c7?auto=format&q=75&fit=crop&w=600",
    date: "2023-09-15",
    author: {
      id: "a3",
      name: "Mike Johnson",
      avatar: "https://i.pravatar.cc/150?img=8"
    },
    category: "Streaming"
  }
];
