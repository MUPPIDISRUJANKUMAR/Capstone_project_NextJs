"use client";

import { Edit } from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useAuth } from "../../../contexts/AuthContext";

interface ProfileAvatarProps {
  onEditClick: () => void;
}

export function AlumniProfileAvatar({ onEditClick }: ProfileAvatarProps) {
  const { user } = useAuth();

  return (
    <div className="relative w-[98px] h-[98px]">
      <Avatar className="w-full h-full">
        <AvatarImage src={user?.avatar} alt={user?.name} />
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
      <div className="absolute bottom-0 right-0">
        <Button
          onClick={onEditClick}
          className="rounded-full w-8 h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
