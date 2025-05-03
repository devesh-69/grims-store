
import { Author, Blog } from "./blog";

export interface BlogFormData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date?: string;
  publishedAt?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  status?: string;
  category?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string;
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
