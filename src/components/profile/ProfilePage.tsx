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
      // Determine if the user has a sufficiently complete profile to view
      // We can check for a few key fields, not just bio
      const hasProfileData = (user as any).bio || (user as any).skills?.length > 0 || (user as any).major;

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
