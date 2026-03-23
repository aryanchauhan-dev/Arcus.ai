import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, logLoginAttempt } from "@/lib/rateLimit";
import { NextResponse } from "next/server";


export async function POST(req: Request){
    try {
        const {email, password} = await req.json();
        const ipAddress = req.headers.get("x-forwarded-for") ?? undefined

        const isBlocked = await checkRateLimit(email, ipAddress ?? "");
        if(isBlocked){
            return NextResponse.json({
                error: "Too many attempts. Try again in 15 minutes."
            }, {status: 429});
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if(!user){
            await logLoginAttempt(email, false, ipAddress);
            return NextResponse.json({
                error: "Invalid Credentials"
            }, {status: 401})
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if(!valid){
            await logLoginAttempt(email, false, ipAddress, user.id);
            return NextResponse.json({
                error: "Invalid Credentials"
            }, {status: 401})
        }

        await logLoginAttempt(email, true, ipAddress, user.id);

        const accessToken = signAccessToken({id: user.id, email: user.email});
        const refreshToken = signRefreshToken({id: user.id});

        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress,
                userAgent: req.headers.get("user-agent") ?? undefined
            },
        });

        const response = NextResponse.json({success: true});

        response.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 15,
            path: "/"
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
        }, {status: 500});
    }
}