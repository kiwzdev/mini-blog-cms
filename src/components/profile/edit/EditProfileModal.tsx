import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IUpdateUserData, IUserProfile } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
  onSave: (data: IUpdateUserData) => void;
  isUpdating: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    jobTitle: profile?.jobTitle || "",
    company: profile?.company || "",
    website: profile?.socialLinks?.website || "",
    github: profile?.socialLinks?.github || "",
    twitter: profile?.socialLinks?.twitter || "",
    linkedin: profile?.socialLinks?.linkedin || "",
    instagram: profile?.socialLinks?.instagram || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full p-2 border rounded-md"
                placeholder="https://"
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
