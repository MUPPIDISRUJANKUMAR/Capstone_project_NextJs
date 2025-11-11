"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultAvatars = [
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Coco",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Lucy",
];

export function AlumniEditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || "");
    }
  }, [user, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;

    if (!storage) {
      showToast("Storage not available. Please check Firebase configuration.", "error");
      return;
    }

    setIsUploading(true);
    showToast("Uploading image...", "info");

    const storageRef = ref(storage, `avatars/${user.id}/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setAvatar(downloadURL);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      showToast("Image upload failed.", "error");
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ avatar });
      showToast("Avatar updated successfully!", "success");
      onClose();
    } catch (error) {
      showToast("Failed to update avatar.", "error");
      console.error("Failed to update avatar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Edit Avatar</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatar} alt={user?.name} />
                    <AvatarFallback>
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Image URL"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-center mb-2">Or choose a default avatar</p>
                  <div className="flex justify-center space-x-2">
                    {defaultAvatars.map((defaultAvatar, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-full cursor-pointer transition-transform transform hover:scale-110 ${
                          avatar === defaultAvatar ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setAvatar(defaultAvatar)}
                      >
                        <img src={defaultAvatar} alt={`Default Avatar ${index + 1}`} className="w-full h-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || isUploading}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
