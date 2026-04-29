import { getCurrentProfile } from "@/lib/auth";
import HeaderClient from "./HeaderClient";

export default async function HeaderServer() {
  const profile = await getCurrentProfile();
  return <HeaderClient initialProfile={profile} />;
}
