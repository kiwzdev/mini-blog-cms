import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image";
import { IUpdateProfileData, IUserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Input Component
const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  rows,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md resize-none"
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
      />
    )}
  </div>
);

// Profile Image Upload Component
const ProfileImageUpload = ({
  currentImage,
  onImageSelect,
  previewUrl,
  isUpdating,
}: {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  previewUrl?: string;
  isUpdating: boolean;
}) => (
  <div className="flex justify-center mb-6">
    <div className="relative">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <Image
          src={previewUrl || getImageUrl(currentImage || "")}
          alt="Profile"
          className="w-full h-full object-cover rounded-full border-1"
          fill
        />
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
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageSelect(file);
          }}
          className="hidden"
          id="upload"
          disabled={isUpdating}
        />
      </div>
    </div>
  </div>
);

// Edit Profile Modal
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
    coverImage: profile?.coverImage || "",
    location: profile?.location || "",
    jobTitle: profile?.jobTitle || "",
    company: profile?.company || "",
    education: profile?.education || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

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
      profileImage: selectedFile || formData.profileImage,
    };
    onSave(updateData);
  };

  // ฟิลด์พื้นฐาน
  const basicFields = [
    { key: "name", label: "ชื่อ", required: true },
    { key: "bio", label: "Bio", rows: 3, maxLength: 300 },
    { key: "jobTitle", label: "ตำแหน่งงาน" },
    { key: "company", label: "บริษัท" },
    { key: "education", label: "การศึกษา", placeholder: "เช่น มหาวิทยาลัย, ปริญญา" },
    { key: "location", label: "ที่อยู่" },
    { key: "email", label: "อีเมล", type: "email" },
    { key: "phone", label: "เบอร์โทรศัพท์", type: "tel" },
    { key: "coverImage", label: "Cover Image URL", type: "url", placeholder: "https://" },
  ];

  // Social Links
  const socialFields = [
    { key: "website", label: "Website", placeholder: "https://" },
    { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
    { key: "twitter", label: "Twitter", placeholder: "https://twitter.com/username" },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username" },
    { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">แก้ไขโปรไฟล์</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ProfileImageUpload
              currentImage={profile?.profileImage}
              onImageSelect={handleImageSelect}
              previewUrl={previewUrl}
              isUpdating={isUpdating}
            />

            {/* Basic Fields */}
            {basicFields.map((field) => (
              <FormInput
                key={field.key}
                label={field.label}
                type={field.type}
                value={formData[field.key as keyof typeof formData] as string}
                onChange={(value) =>
                  setFormData({ ...formData, [field.key]: value })
                }
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                required={field.required}
                rows={field.rows}
              />
            ))}

            {/* Social Links Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Social Links</h4>
              <div className="space-y-3">
                {socialFields.map((field) => (
                  <FormInput
                    key={field.key}
                    label={field.label}
                    type="url"
                    value={formData.socialLinks[field.key as keyof typeof formData.socialLinks]}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          [field.key]: value,
                        },
                      })
                    }
                    placeholder={field.placeholder}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isUpdating}
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