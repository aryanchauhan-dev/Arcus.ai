import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/jwt";


const protectedRoutes = [
    "/dashboard",
    "/resume-builder",
    "/interview",
    "/ai-cover-letter"
];

export function proxy(req: NextRequest){
    const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    if(!isProtected) return NextResponse.next();

    const token = req.cookies.get("access_token")?.value;
    const user = token ? verifyAccessToken(token) : null;

    if(!user){
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user.id);

    return NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/resume-builder/:path*",
        "/interview/:path*",
        "/ai-cover-letter/:path*"
    ],
};