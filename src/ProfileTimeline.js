import React from "react";

export default function ProfileTimeline({ resource }) {
  const timeline = resource.read();

  return (
    <ul>
      {timeline.map((it) => (
        <li key={it.id}>{it.message}</li>
      ))}
    </ul>
  );
}
