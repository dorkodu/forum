import DefaultLayout from "@/components/layouts/DefaultLayout";
import CenterLoader from "@/components/loaders/CenterLoader";
import React, { Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import App from "../App";
import { useWait } from "../components/hooks";
import RequireAuth from "../components/RequireAuth";

const LazyHome = React.lazy(useWait(() => import("./Home")));
const LazyProfile = React.lazy(useWait(() => import("./profile/Profile")));
const LazyFollower = React.lazy(useWait(() => import("./profile/Follower")));
const LazyFollowing = React.lazy(useWait(() => import("./profile/Following")));
const LazyDiscussion = React.lazy(useWait(() => import("./Discussion")));
const LazySearch = React.lazy(useWait(() => import("./Search")));
const LazyMenu = React.lazy(useWait(() => import("./Menu")));
const LazyDorkoduID = React.lazy(useWait(() => import("./DorkoduID")));

const LazyDiscussionEditor = React.lazy(useWait(() => import("./DiscussionEditor")));
const LazyNotifications = React.lazy(useWait(() => import("./Notifications")));

const LazyNotFound = React.lazy(useWait(() => import("./NotFound")));

const Home = <Suspense fallback={<CenterLoader />}><LazyHome /></Suspense>
const Profile = <Suspense fallback={<CenterLoader />}><LazyProfile /></Suspense>
const Follower = <Suspense fallback={<CenterLoader />}><LazyFollower /></Suspense>
const Following = <Suspense fallback={<CenterLoader />}><LazyFollowing /></Suspense>
const Discussion = <Suspense fallback={<CenterLoader />}><LazyDiscussion /></Suspense>
const Search = <Suspense fallback={<CenterLoader />}><LazySearch /></Suspense>
const Menu = <Suspense fallback={<CenterLoader />}><LazyMenu /></Suspense>
const DorkoduID = <Suspense fallback={<CenterLoader />}><LazyDorkoduID /></Suspense>

const DiscussionEditor = <Suspense fallback={<CenterLoader />}><LazyDiscussionEditor /></Suspense>
const Notifications = <Suspense fallback={<CenterLoader />}><LazyNotifications /></Suspense>

const NotFound = <Suspense fallback={<CenterLoader />}><LazyNotFound /></Suspense>

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route element={<DefaultLayout />}>
        {/* Navigate to "/home" on path "/" */}
        <Route index element={<Navigate to="/home" />} />

        {/* Routes that don't require authentication */}
        <Route path="/home" element={Home} />
        <Route path="/profile/:username" element={Profile} />
        <Route path="/profile/:username/followers" element={Follower} />
        <Route path="/profile/:username/following" element={Following} />
        <Route path="/discussion/:id" element={Discussion} />
        <Route path="/search" element={Search} />
        <Route path="/menu" element={Menu} />
        <Route path="/dorkodu-id" element={DorkoduID} />

        {/* Routes that require authentication */}
        <Route element={<RequireAuth />}>
          <Route path="/discussion-editor" element={DiscussionEditor} />
          <Route path="/discussion-editor/:id" element={DiscussionEditor} />
          <Route path="/notifications" element={Notifications} />
        </Route>

        {/* Error routes & catch all */}
        <Route path="/404" element={NotFound} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Route>
    </Route>
  )
)
