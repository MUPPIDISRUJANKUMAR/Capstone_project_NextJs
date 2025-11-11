'use client'

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { AlumniEditProfileModal } from "./AlumniEditProfileModal";
import { AlumniProfileAvatar } from "./AlumniProfileAvatar";

export function AlumniViewProfile({ setEditing }: { setEditing: (editing: boolean) => void }) {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <>
      <Card className="relative pt-12">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Profile</CardTitle>
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </CardHeader>
        <div className="absolute top-24 left-1/2 -translate-x-1/2">
          <AlumniProfileAvatar onEditClick={() => setIsModalOpen(true)} />
        </div>
        <CardContent className="space-y-4 mt-16">
          <div>
            <h3 className="font-semibold">Bio</h3>
            <p>{(user as any).bio}</p>
          </div>
          <div>
            <h3 className="font-semibold">Skills</h3>
            <p>{(user as any).skills?.join(", ")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Interests</h3>
            <p>{(user as any).interests?.join(", ")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Goals</h3>
            <p>{(user as any).goals?.join(", ")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Major</h3>
            <p>{(user as any).major}</p>
          </div>
          <div>
            <h3 className="font-semibold">Graduation Year</h3>
            <p>{(user as any).graduationYear}</p>
          </div>
          <div>
            <h3 className="font-semibold">Industry</h3>
            <p>{(user as any).industry}</p>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <p>{(user as any).company}</p>
          </div>
          <div>
            <h3 className="font-semibold">Position</h3>
            <p>{(user as any).position}</p>
          </div>
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{(user as any).location}</p>
          </div>
          <div>
            <h3 className="font-semibold">Availability</h3>
            <p>{(user as any).availability}</p>
          </div>
        </CardContent>
      </Card>
      <AlumniEditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
