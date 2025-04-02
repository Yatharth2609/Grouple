import { onSignInUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const CompleteSigIn = async () => {
  const user = await currentUser()
  console.log("Sign-in callback - Clerk user:", user ? `Found (ID: ${user.id})` : "Not found");
  
  if (!user) {
    console.log("No user found in callback, redirecting to sign-in");
    return redirect("/sign-in")
  }

  const authenticated = await onSignInUser(user.id)
  console.log("Sign-in callback - Authentication result:", JSON.stringify(authenticated));

  // Database connection error
  if (authenticated.status === 503) {
    console.log("Database connection error in callback");
    return redirect("/db-error");
  }

  // If the user exists in Clerk but not in our database yet
  if (authenticated.status === 404) {
    console.log("User not found in database, redirecting to complete signup");
    return redirect("/callback/complete");
  }

  if (authenticated.status === 200) {
    console.log("Authentication successful, redirecting to create group");
    return redirect(`/group/create`)
  }

  if (authenticated.status === 207) {
    console.log(`Redirecting to existing group: ${authenticated.groupId}/channel/${authenticated.channelId}`);
    return redirect(
      `/group/${authenticated.groupId}/channel/${authenticated.channelId}`,
    )
  }

  // Default fallback
  console.log("Authentication failed with status:", authenticated.status);
  return redirect("/sign-in")
}

export default CompleteSigIn
