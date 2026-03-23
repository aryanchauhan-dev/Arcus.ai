import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashedPassword, validatePasswordStrength } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: Request){
    try {
        const {email, password, name} = await req.json();
        if(!email || !password){
            return NextResponse.json({
                error: "Email and Password required."
            }, {status: 400});
        }

        const passwordError = validatePasswordStrength(password);
        if(passwordError){
            return NextResponse.json({
                error: passwordError
            }, {status: 400})
        }

        const existing = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if(existing){
            return NextResponse.json({
                error: "Invalid Credentials"
            }, {status: 400});
        }

        const passwordHash = await hashedPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name
            }
        });

        const accessToken = signAccessToken({id: user.id , email: user.email});
        const refreshToken = signRefreshToken({id: user.id});
        await prisma.session.create({
            data:{
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
                userAgent: req.headers.get("user-agent") ?? undefined
            },
        });

        const response = NextResponse.json({success: true});

        response.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 15,
            path : "/"
        });

        response.cookies.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });

        return response;

    } catch (error) {
        return NextResponse.json({
            error: "Internal Server Error"
        }, {status: 500})
    }
}