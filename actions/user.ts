"use server"
import { auth } from "@clerk/nextjs/server";

export async function updateUser(){
    const {userId} = await auth();
    if(!userId) throw new Error("Unauthorized");
}