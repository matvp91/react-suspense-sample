import React, { Suspense, useState } from "react";
import NavButton from "./NavButton";
import { resourceTimeline, resourceProfile } from "./api";
import { preloadResources } from "./createResource";

const Pages = {
  home: "home",
  profile: "profile",
};

const PageComponents = {
  [Pages.home]: React.lazy(() => import("./Home")),
  [Pages.profile]: React.lazy(() => import("./Profile")),
};

export default function App() {
  const [page, setPage] = useState(Pages.home);

  const Page = PageComponents[page];

  return (
    <>
      <ul>
        <li>
          <NavButton onClick={() => setPage("home")}>Home</NavButton>
        </li>
        <li>
          <NavButton
            onClick={() => setPage("profile")}
            preload={preloadResources([resourceTimeline, resourceProfile])}
          >
            Profile
          </NavButton>
        </li>
      </ul>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Page />
        </Suspense>
      </div>
    </>
  );
}
