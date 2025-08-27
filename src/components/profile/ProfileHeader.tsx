import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { getImageUrl } from "@/lib/image";
import {
  Calendar,
  MapPin,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Briefcase,
  Edit,
  UserPlus,
  Check,
  Loader2,
  Settings,
  Phone,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button";
import { IUserBadge, IUserProfile } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ProfileStats } from "./ProfileStats";

type ProfileHeaderProps = {
  profile: IUserProfile;
  isOwner: boolean;
  isPrivateProfile: boolean;
  isFollowing: boolean;
  isToggling: boolean;
  onFollowToggle: () => void;
  onEditProfile: () => void;
  onSettings: () => void;
  onStatsClick: (type: "followers" | "following" | "blogs" | "likes") => void;
  followerCount: number;
};

export function ProfileHeader({
  profile,
  isOwner,
  isPrivateProfile,
  isFollowing,
  isToggling,
  onFollowToggle,
  onEditProfile,
  onSettings,
  onStatsClick,
  followerCount,
}: ProfileHeaderProps) {
  return (
    <Card className="glass-card mb-8 border-0 shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Avatar & Quick Actions */}
          <div className="flex flex-col justify-evenly lg:items-start gap-4">
            <div className="relative mx-auto">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <Image
                  priority={true}
                  src={getImageUrl(profile.profileImage || "")}
                  alt={profile.name}
                  fill
                  sizes="100%"
                  className="rounded-full  shadow-lg object-cover"
                />
                {/* Online Status - Hidden if profile is private and not own profile */}
                {profile.lastActiveAt && (!isPrivateProfile || isOwner) && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                )}
                {/* Verification Badge */}
                {profile.isVerified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && (
              <div className="mx-auto">
                <Button
                  size="sm"
                  onClick={onFollowToggle}
                  disabled={isToggling}
                  className={`min-w-[100px] transition-all duration-200 ${
                    isFollowing || profile.isFollowed
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing || profile.isFollowed ? (
                    ""
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {isFollowing || profile.isFollowed ? "Following" : "Follow"}
                </Button>
              </div>
            )}

            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px]"
                  onClick={onEditProfile}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px]"
                  onClick={onSettings}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  ตั้งค่าโปรไฟล์
                </Button>
              </>
            )}
          </div>

          {/* Center: Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h1>
                {profile.badge && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile.badge === ("creator" as IUserBadge)
                        ? "bg-purple-100 text-purple-700"
                        : profile.badge === ("pro" as IUserBadge)
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {profile.badge.toString().toUpperCase()}
                  </span>
                )}
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                @{profile.username}
              </p>

              {/* Job Title & Company - Hidden if profile is private and not own profile */}
              {(profile.jobTitle || profile.company) &&
                (!isPrivateProfile || isOwner) && (
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-slate-600 dark:text-slate-400 mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>
                      {profile.jobTitle}
                      {profile.jobTitle && profile.company && " ที่ "}
                      {profile.company}
                    </span>
                  </div>
                )}
              {/* Privacy Indicator for Private Profiles */}
              {profile.settings?.profileVisibility === "private" &&
                !isOwner && (
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-600 dark:text-amber-400 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">โปรไฟล์ส่วนตัว</span>
                  </div>
                )}
            </div>

            {profile.bio && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center lg:text-left">
                {profile.bio}
              </p>
            )}

            {/* Meta Info - Hidden if profile is private and not own profile */}
            {(!isPrivateProfile || isOwner) && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    เข้าร่วมเมื่อ {formatDate(new Date(profile.createdAt))}
                  </div>
                  {profile.settings?.showPhone ||
                    (isOwner && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {profile.phone}
                      </div>
                    ))}
                  {profile.settings?.showPhone ||
                    (isOwner && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                    ))}
                </div>

                {profile.lastActiveAt && (
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    ออนไลน์ล่าสุด{" "}
                    {formatDistanceToNow(new Date(profile.lastActiveAt))}
                  </div>
                )}
              </div>
            )}

            {/* Social Links - Hidden if profile is private and not own profile */}
            {profile.socialLinks &&
              Object.keys(profile.socialLinks).length > 0 &&
              (!isPrivateProfile || isOwner) && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {profile.socialLinks.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hover:bg-slate-50"
                    >
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hover:bg-slate-50"
                    >
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hover:bg-slate-50"
                    >
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.linkedin && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hover:bg-slate-50"
                    >
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  )}

                  {profile.socialLinks.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hover:bg-slate-50"
                    >
                      <a
                        href={profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}

            {/* Private Profile Message */}
            {profile.settings?.profileVisibility === "private" && !isOwner && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">โปรไฟล์นี้เป็นส่วนตัว</span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  ข้อมูลรายละเอียดและกิจกรรมถูกจำกัดการเข้าถึง
                </p>
              </div>
            )}
          </div>
          {/* Profile Stats */}
          <ProfileStats
            profile={profile}
            isPrivateProfile={isPrivateProfile}
            followerCount={followerCount}
            onStatClick={onStatsClick}
            isOwner={isOwner}
          />
        </div>
      </CardContent>
    </Card>
  );
}
