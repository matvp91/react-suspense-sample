import React, { useState } from "react";
import { resourceTimeline } from "./api";

export default function ProfileTimeline() {
  const timeline = resourceTimeline.read();

  return (
    <ul>
      {timeline.items.map((it) => (
        <li key={it.id}>{it.id}</li>
      ))}
    </ul>
  );
}
