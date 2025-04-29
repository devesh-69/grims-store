
export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  author: Author;
  category?: string;
}
