import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const checkUser = async () => {
    const user = await currentUser();
    if(!user) return null;

    try {
        const existingUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });

        if(existingUser) return existingUser;

        const name = `${user.firstName} ${user.lastName}`;

        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name,
                imageUrl: user.imageUrl || undefined 
           },
        });

        return newUser;
    } catch (error) {
        console.error("Error checking user", error);
        return null;
    }
}