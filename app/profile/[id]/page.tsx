'use client'

import { ViewProfile } from "../../../src/components/profile/ViewProfile";

export default function ViewProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background p-8">
      <ViewProfile setEditing={() => {}} />
    </div>
  );
}
