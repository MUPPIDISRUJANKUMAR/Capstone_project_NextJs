'use client'

import { useState, useEffect } from "react";
import { EditProfileForm } from "./EditProfileForm";
import { ViewProfile } from "./ViewProfile";
import { useAuth } from "../../contexts/AuthContext";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // More robust check to see if a profile is "complete"
      const hasProfileData =
        ((user as any).bio && (user as any).bio !== 'Student account' && (user as any).bio !== 'Alumni professional') ||
        ((user as any).skills && (user as any).skills.length > 0 && (user as any).skills[0] !== '') ||
        ((user as any).major && (user as any).major !== '');

      if (hasProfileData) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
  }, [user, loading]);

  if (loading) {
    return <div className="container mx-auto py-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {isEditing ? (
        <EditProfileForm onSaveSuccess={() => setIsEditing(false)} />
      ) : (
        <ViewProfile setEditing={setIsEditing} />
      )}
    </div>
  );
}
