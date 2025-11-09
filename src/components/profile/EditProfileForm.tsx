'use client'

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext"; // Import the new useToast hook

export function EditProfileForm({
  onSaveSuccess,
}: {
  onSaveSuccess: () => void;
}) {
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const { showToast } = useToast(); // Use the showToast function from the context
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: (user as any)?.bio || "",
    skills: (user as any)?.skills?.join(", ") || "",
    interests: (user as any)?.interests?.join(", ") || "",
    goals: (user as any)?.goals?.join(", ") || "",
    industry: (user as any)?.industry || "",
    company: (user as any)?.company || "",
    position: (user as any)?.position || "",
    graduationYear: (user as any)?.graduationYear || "",
    major: (user as any)?.major || "",
    location: (user as any)?.location || "",
    availability: (user as any)?.availability || "open",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        bio: (user as any).bio || "",
        skills: (user as any).skills?.join(", ") || "",
        interests: (user as any).interests?.join(", ") || "",
        goals: (user as any).goals?.join(", ") || "",
        industry: (user as any).industry || "",
        company: (user as any).company || "",
        position: (user as any).position || "",
        graduationYear: (user as any).graduationYear || "",
        major: (user as any).major || "",
        location: (user as any).location || "",
        availability: (user as any).availability || "open",
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setFormLoading(true);

    const processedData = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()),
      interests: formData.interests.split(",").map((i) => i.trim()),
      goals: formData.goals.split(",").map((g) => g.trim()),
      graduationYear: Number(formData.graduationYear) || undefined,
    };

    try {
      await updateUserProfile(processedData);
      showToast("Your changes have been saved!", "success", 8000); // Use the global showToast
      console.log("EditProfileForm: Profile saved successfully.");
      onSaveSuccess(); // Call onSaveSuccess immediately
      console.log("EditProfileForm: onSaveSuccess called.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("Failed to save changes.", "error", 20000); // Use the global showToast
      console.log("EditProfileForm: Profile save failed.");
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="skills">Skills (comma-separated)</label>
          <Input
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="interests">Interests (comma-separated)</label>
          <Input
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="goals">Goals (comma-separated)</label>
          <Input
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="major">Major</label>
          <Input
            id="major"
            name="major"
            value={formData.major}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="graduationYear">Graduation Year</label>
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            value={formData.graduationYear}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="industry">Industry</label>
          <Input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="company">Company</label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="position">Position</label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-800"
          >
            <option value="open">Open</option>
            <option value="limited">Limited</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <Button onClick={handleSave} disabled={formLoading}>
          {formLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
