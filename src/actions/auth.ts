"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticatedUser = async () => {
  try {
    const clerk = await currentUser();
    
    // Debug log
    console.log("Clerk user:", clerk ? `Found (ID: ${clerk.id})` : "Not found");
    
    if (!clerk) return { status: 404 }; // Return proper status object
    try {
      const user = await client?.user.findUnique({
        where: { clerkId: clerk.id },
        select: { id: true, firstname: true, lastname: true },
      });

      // Debug log
      console.log("Prisma user:", user ? `Found (ID: ${user.id})` : "Not found");

      if (!user) return { status: 401 }; // User not found in database

      return {
        status: 200,
        id: user.id,
        image: clerk.imageUrl,
        username: `${user.firstname} ${user.lastname}`,
      };
    } catch (dbError: any) {
      console.error("Database error in onAuthenticatedUser:", dbError.message);
      // Return a special status to indicate database connection issue
      return { 
        status: 503,  // Service Unavailable 
        message: "Database connection error. Please try again later."
      };
    }
  } catch (error: any) {
    console.error("onAuthenticatedUser Error:", error.message);
    return { status: 500, message: "Server error. Please try again." };
  }
};

export const onSignUpUser = async (data: {
  firstname: string;
  lastname: string;
  image: string;
  clerkId: string;
}) => {
  try {
    try {
      const createdUser = await client?.user.create({ data });

      return {
        status: 201, // 201 for successful creation
        message: "User successfully created",
        id: createdUser?.id,
      };
    } catch (dbError: any) {
      console.error("Database error in onSignUpUser:", dbError.message);
      return { 
        status: 503, 
        message: "Database connection error. Please try again later." 
      };
    }
  } catch (error: any) {
    console.error("onSignUpUser Error:", error.message);
    return { status: 500, message: "Server error. Please try again." };
  }
};

export const onSignInUser = async (clerkId: string) => {
  try {
    try {
      const loggedInUser = await client?.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          group: {
            select: {
              id: true,
              channel: {
                select: { id: true },
                take: 1,
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      });

      if (!loggedInUser) {
        return { status: 404, message: "User not found. Please sign up first." };
      }

      // Handle user with no group or channel
      if (!loggedInUser.group.length || !loggedInUser.group[0].channel.length) {
        return {
          status: 200,
          message: "User successfully logged in",
          id: loggedInUser.id,
        };
      }

      return {
        status: 207, // 207: Partial success (user found, channel exists)
        id: loggedInUser.id,
        groupId: loggedInUser.group[0].id,
        channelId: loggedInUser.group[0].channel[0].id,
      };
    } catch (dbError: any) {
      console.error("Database error in onSignInUser:", dbError.message);
      return { 
        status: 503, 
        message: "Database connection error. Please try again later." 
      };
    }
  } catch (error: any) {
    console.error("onSignInUser Error:", error.message);
    return { status: 500, message: "Server error. Please try again." };
  }
};
