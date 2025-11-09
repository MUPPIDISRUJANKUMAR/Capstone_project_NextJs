'use client'

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ViewProfile({ setEditing }: { setEditing: (editing: boolean) => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Profile</CardTitle>
        <Button onClick={() => setEditing(true)}>Edit Profile</Button>
      </CardHeader>
      <CardContent className="space-y-4">
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
  );
}