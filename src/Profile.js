import React, { Suspense } from "react";
import ProfileTimeline from "./ProfileTimeline";
import { resourceProfile } from "./api";

export default function Profile() {
  const profile = resourceProfile.read();

  return (
    <div>
      <h1>
        {profile.firstName} {profile.lastName}
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileTimeline />
      </Suspense>
    </div>
  );
}
