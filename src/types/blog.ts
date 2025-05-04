
export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: string[];
  date: string;
  author: Author;
  status?: 'draft' | 'published';
  publishedAt?: string;
  featured?: boolean;
  commentsEnabled?: boolean;
  content?: string; // Backward compatibility
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string[];
  };
  socialPreview?: {
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
  };
}
