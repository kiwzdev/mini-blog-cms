import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { IUserSettings } from "@/types/user"; // ปรับ path ให้ถูก

export const SettingProfileModal = ({
  settings,
  isOpen,
  onClose,
  onSave,
  isUpdating,
}: {
  settings: IUserSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IUserSettings) => void;
  isUpdating: boolean;
}) => {
  const [formData, setFormData] = useState<IUserSettings>({
    profileVisibility: settings?.profileVisibility || "public",
    showEmail: settings?.showEmail ?? true,
    showPhone: settings?.showPhone ?? false,
    allowComments: settings?.allowComments ?? true,
  });

  const handleChange = (key: keyof IUserSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">ตั้งค่าโปรไฟล์</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile visibility */}
            <div>
              <Label className="block mb-2">การมองเห็นโปรไฟล์</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.profileVisibility}
                onChange={(e) =>
                  handleChange("profileVisibility", e.target.value as "public" | "private")
                }
              >
                <option value="public">สาธารณะ</option>
                <option value="private">ส่วนตัว</option>
              </select>
            </div>

            {/* Show email */}
            <div className="flex items-center justify-between">
              <Label>แสดงอีเมล</Label>
              <Switch
                checked={formData.showEmail}
                onCheckedChange={(val) => handleChange("showEmail", val)}
              />
            </div>

            {/* Show phone */}
            <div className="flex items-center justify-between">
              <Label>แสดงเบอร์โทร</Label>
              <Switch
                checked={formData.showPhone}
                onCheckedChange={(val) => handleChange("showPhone", val)}
              />
            </div>

            {/* Allow comments */}
            <div className="flex items-center justify-between">
              <Label>อนุญาตให้คอมเมนต์</Label>
              <Switch
                checked={formData.allowComments}
                onCheckedChange={(val) => handleChange("allowComments", val)}
              />
            </div>

            {/* Save button */}
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
