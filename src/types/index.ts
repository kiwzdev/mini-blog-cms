export interface IUser {
  id: string;
  email: string;
  name?: string;
  username: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  // Public fields
  id: string;
  username: string; // unique, for URL
  name?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdAt: Date;

  // Private fields (เฉพาะเจ้าของ)
  email?: string;
  phone?: string;
  settings?: {
    profileVisibility: "public" | "private";
    showEmail: boolean;
    allowComments: boolean;
  };

  // Stats
  _count: {
    posts: number;
    followers?: number;
    following?: number;
  };
}

export interface signUpData {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  createdAt: Date;
  category?: string;
  author: {
    id: string;
    name?: string;
    profileImage?: string;
    username: string;
  };
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface ICreatePostInput {
  title: string;
  slug: string;
  content: string;
  contentType: "markdown" | "richtext";
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  category?: string;
}

export interface IUpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  contentType?: "markdown" | "richtext";
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  category?: string;
}

export interface IPost extends IPostPreview {
  updatedAt: Date;
  content: string;
  contentType: "markdown" | "richtext";

  comments?: IComment[];
  likes?: ILike[];
}

export interface IComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  authorId: string;
  author: IUser;
}

export interface ILike {
  id: string;
  postId: string;
  userId: string;
  user: IUser;
}
