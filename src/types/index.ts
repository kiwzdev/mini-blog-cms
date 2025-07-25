export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentType: "markdown" | "richtext";
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  _count?: {
    comments: number;
    likes: number;
  };
}


export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  authorId: string;
  author: User;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  user: User;
}
