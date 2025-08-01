export interface IUser {
  id: string;
  email: string;
  name: string;
  username: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  // Public fields
  id: string;
  username: string; // unique, for URL
  name: string;
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