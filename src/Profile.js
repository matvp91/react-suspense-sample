import React, { Suspense } from "react";
import ProfileTimeline from "./ProfileTimeline";
import { TimelineResource } from "./api";
import { useResource } from "./createResource";

export default function Profile({ resource }) {
  const profile = resource.read();

  const timelineResource = useResource(
    () => TimelineResource({ id: profile.id }),
    [profile]
  );

  return (
    <div>
      <h1>
        {profile.firstName} {profile.lastName}
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileTimeline resource={timelineResource} />
      </Suspense>
    </div>
  );
}
