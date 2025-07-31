// Types for better TypeScript support
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  coverImage?: string;
  bio?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isFollower?: boolean;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
}

export interface FollowData {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
