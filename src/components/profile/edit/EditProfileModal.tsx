import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image";
import { getCloudinaryUrl } from "@/lib/image/cloudinary";
import { IUpdateProfileData, IUserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { env } from "process";
import { useEffect, useState } from "react";

// Edit Profile Modal (Simple version - you might want to create a more complex one)
export const EditProfileModal = ({
  profile,
  isOpen,
  onClose,
  onSave,
  isUpdating,
}: {
  profile: IUserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IUpdateProfileData) => void;
  isUpdating: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    profileImage: profile?.profileImage || "",
    location: profile?.location || "",
    jobTitle: profile?.jobTitle || "",
    company: profile?.company || "",
    education: profile?.education || "",
    socialLinks: {
      website: profile?.socialLinks?.website || "",
      github: profile?.socialLinks?.github || "",
      twitter: profile?.socialLinks?.twitter || "",
      linkedin: profile?.socialLinks?.linkedin || "",
      instagram: profile?.socialLinks?.instagram || "",
      facebook: profile?.socialLinks?.facebook || "",
      youtube: profile?.socialLinks?.youtube || "",
      tiktok: profile?.socialLinks?.tiktok || "",
    },
  });
  console.log(getCloudinaryUrl(profile?.profileImage || ""));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Handle file selection
  const handleImageSelect = (file: File) => {
    setSelectedFile(file);

    // สร้าง preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: IUpdateProfileData = {
      ...formData,
      // ถ้ามี file ใหม่ให้ส่ง file, ถ้าไม่มีให้ส่ง string เดิม
      profileImage: selectedFile || formData.profileImage,
    };

    onSave(updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">แก้ไขโปรไฟล์</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {formData.profileImage ? (
                    <Image
                      src={
                        previewUrl || getCloudinaryUrl(profile?.profileImage || "")
                      }
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-1"
                      fill
                    />
                  ) : (
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_DEFAULT_PROFILE_IMAGE!
                      }
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-1"
                      fill
                    />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer">
                  <label
                    htmlFor="upload"
                    className="cursor-pointer w-full h-full flex items-center justify-center"
                  >
                    +
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageSelect(file);
                      }
                    }}
                    className="hidden"
                    id="upload"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อ</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full p-2 border rounded-md h-20"
                maxLength={160}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                ตำแหน่งงาน
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">บริษัท</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">การศึกษา</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                className="w-full p-2 border rounded-md"
                placeholder="เช่น มหาวิทยาลัย, ปริญญา"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ที่อยู่</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      website: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub</label>
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      github: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      twitter: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://instagram.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      facebook: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://facebook.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      youtube: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://youtube.com/@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                type="url"
                value={formData.socialLinks.tiktok}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: {
                      ...formData.socialLinks,
                      tiktok: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://tiktok.com/@username"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isUpdating} className="flex-1">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึก"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
