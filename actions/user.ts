"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function updateUser(){
    const {userId} = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId : userId,
        },
    });

    if(!userId) throw new Error("User not found");

    try {
        
    } catch (error) {
        
    }
}