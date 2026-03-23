import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function POST() {
    const refreshToken = (await cookies()).get("refresh_token")?. value;
    
    if(refreshToken){
        await prisma.session.deleteMany({
            where: {
                token: refreshToken
            }
        });
    }

    const response = NextResponse.json({success: true});
    response.cookies.set("access_token", "", {maxAge: 0, path: "/"});
    response.cookies.set("refresh_token", "", {maxAge: 0, path: "/"});

    return response;
}