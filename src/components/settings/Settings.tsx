'use client'

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../contexts/AuthContext";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Label } from "../ui/label";
import { useTheme } from "../../contexts/ThemeContext";

const Settings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user || !storage) return;

    setUploading(true);
    const storageRef = ref(storage, `avatars/${user.id}/${avatarFile.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, avatarFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateUserProfile({ avatar: downloadURL });
      setAvatarFile(null);
    } catch (error) {
      console.error("Error uploading avatar: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.avatar || "/placeholder-avatar.png"} alt="User Avatar" />
              <AvatarFallback>{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
            </Avatar>
            <Input type="file" onChange={handleFileChange} />
            <Button onClick={handleAvatarUpload} disabled={!avatarFile || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Enter your name" defaultValue={user?.name || ''} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="user@example.com" defaultValue={user?.email || ''} disabled />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Change Password</Label>
            <Input type="password" placeholder="New password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch />
          </div>
          <div>
            <Label>Language</Label>
            <select className="border rounded px-2 py-1 w-full mt-1 dark:bg-gray-800">
              <option>English</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Spanish</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Two-Factor Authentication</Label>
            <Switch />
          </div>
          <Button variant="outline">Manage Sessions</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
          <Button variant="outline" className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
