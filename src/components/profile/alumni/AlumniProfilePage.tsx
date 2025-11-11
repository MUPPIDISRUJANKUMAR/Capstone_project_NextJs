'use client'

import { useState } from "react";
import { EditProfileForm } from "../EditProfileForm";
import { AlumniViewProfile } from "./AlumniViewProfile";
import { useAuth } from "../../../contexts/AuthContext";

export function AlumniProfilePage() {
  const { loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return <div className="container mx-auto py-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {isEditing ? (
        <EditProfileForm onSaveSuccess={() => setIsEditing(false)} />
      ) : (
        <AlumniViewProfile setEditing={setIsEditing} />
      )}
    </div>
  );
}
