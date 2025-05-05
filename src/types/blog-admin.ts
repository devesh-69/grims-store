
import { Author, Blog } from "./blog";

export interface BlogFormData {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: string[];
  date?: string;
  publishedAt?: string;
  author: Author;
  status: 'draft' | 'published';
  featured?: boolean;
  commentsEnabled?: boolean;
  keywords?: string[];
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

export interface BlogsTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export interface BlogEditorProps {
  blog?: Blog;
  onSave: (blog: BlogFormData) => Promise<void>;
  onCancel: () => void;
}
