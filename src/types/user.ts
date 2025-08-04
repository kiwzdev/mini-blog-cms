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
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  location?: string;
  createdAt: Date;
  lastActiveAt?: Date;
  isVerified?: Date;

  // Professional info
  jobTitle?: string;
  company?: string;
  education?: string;

  // Verification & status
  status?: IUserStatus;
  badge?: IUserBadge;

  // Private fields (เฉพาะเจ้าของ)
  email?: string;
  phone?: string;
  birthDate?: Date;
  settings?: IUserSettings;

  // Stats
  _count: IUserCount;
}

export interface IUserSocialLinks {
  twitter?: string;
  github?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface IUserStatus {
  status?: "active" | "inactive" | "banned";
}

export interface IUserBadge {
  badge?: "creator" | "pro" | "premium" | null;
}

export interface IUserSettings {
  profileVisibility?: "public" | "private";
  showEmail?: boolean;
  showPhone?: boolean;
  allowComments?: boolean;
}

export interface IUserCount {
  blogs: number;
  followers: number;
  following: number;
  blogLikes: number;
  views: number;
  comments: number;
}

export interface IUpdateUserData {
  name?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  education?: string;
  phone?: string;
  socialLinks?: IUserProfile['socialLinks'];
  settings?: IUserProfile['settings'];
}
