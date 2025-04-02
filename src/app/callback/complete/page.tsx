import { onSignUpUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const CompleteOAuthAfterCallback = async () => {
  const user = await currentUser()
  console.log("Complete callback - Clerk user:", user ? `Found (ID: ${user.id})` : "Not found");
  
  if (!user) {
    console.log("No user found in complete callback, redirecting to sign-in");
    return redirect("/sign-in");
  }

  // Check for required user fields
  if (!user.firstName || !user.lastName) {
    console.log("Missing required user info from Clerk");
    return redirect("/sign-in");
  }

  const complete = await onSignUpUser({
    firstname: user.firstName as string,
    lastname: user.lastName as string,
    image: user.imageUrl,
    clerkId: user.id,
  })

  console.log("Complete callback - Sign up result:", JSON.stringify(complete));

  if (complete.status === 201) {
    console.log("User created successfully, redirecting to create group");
    return redirect(`/group/create`);
  }

  console.log("Sign up failed with status:", complete.status);
  return redirect("/sign-in");
}

export default CompleteOAuthAfterCallback
