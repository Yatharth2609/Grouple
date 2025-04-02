import { onSignUpUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const CompleteSignUp = async () => {
  const user = await currentUser()
  console.log("Sign-up callback - Clerk user:", user ? `Found (ID: ${user.id})` : "Not found");
  
  if (!user) {
    console.log("No user found in callback, redirecting to sign-in");
    return redirect("/sign-in")
  }

  // Create user in our database
  const result = await onSignUpUser({
    firstname: user.firstName || "",
    lastname: user.lastName || "",
    image: user.imageUrl || "",
    clerkId: user.id
  });

  console.log("Sign-up callback - User creation result:", JSON.stringify(result));

  // Database connection error
  if (result.status === 503) {
    console.log("Database connection error in callback");
    return redirect("/db-error");
  }

  // If user creation was successful
  if (result.status === 201) {
    console.log("User created successfully, redirecting to create group");
    return redirect("/group/create");
  }

  // Default fallback
  console.log("Sign-up failed with status:", result.status);
  return redirect("/sign-in")
}

export default CompleteSignUp 