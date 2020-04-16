import React, { Suspense, useState } from "react";
import NavButton from "./NavButton";
import { ProfileResource } from "./api";
import { preloadResources, useResource } from "./createResource";

const Pages = {
  home: "home",
  profile: "profile",
};

const Home = React.lazy(() => import("./Home"));
const Profile = React.lazy(() => import("./Profile"));

export default function App() {
  const [page, setPage] = useState(Pages.home);

  const profileId = 1;
  const profileResource = useResource(
    () => ProfileResource({ id: profileId }),
    [profileId]
  );

  let pageComponent;
  if (page === Pages.profile) {
    pageComponent = <Profile resource={profileResource} />;
  } else {
    pageComponent = <Home />;
  }

  return (
    <>
      <ul>
        <li>
          <NavButton onClick={() => setPage("home")}>Home</NavButton>
        </li>
        <li>
          <NavButton
            onClick={() => setPage("profile")}
            preload={preloadResources([profileResource])}
          >
            Profile
          </NavButton>
        </li>
      </ul>
      <div>
        <Suspense fallback={<div>Loading...</div>}>{pageComponent}</Suspense>
      </div>
    </>
  );
}
