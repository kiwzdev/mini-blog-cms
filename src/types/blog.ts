import { IUser } from "./user";

export interface IBlogCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
  createdAt: Date;
  category?: string;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    username: string;
  };
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface ICreateBlogInput {
  title: string;
  slug: string;
  content: string;
  contentType: "markdown" | "richtext";
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  category?: string;
}

export interface IUpdateBlogInput {
  title?: string;
  slug?: string;
  content?: string;
  contentType?: "markdown" | "richtext";
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  category?: string;
}

export interface IBlog extends IBlogCard {
  updatedAt: Date;
  content: string;
  contentType: "markdown" | "richtext";

  comments?: IComment[];
  likes?: ILike[];
  views: number;
}

export interface IComment {
  id: string;
  content: string;
  createdAt: string;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage: string | null;
    username: string;
  };
  _count?: {
    likes: number;
  };
}

export interface ILike {
  id: string;
  blogId: string;
  userId: string;
  user: IUser;
}

export type DateRange = {
  start: string;
  end: string;
};

export type Filters = {
  category: string;
  status: string;
  search: string;
  dateRange: DateRange;
};