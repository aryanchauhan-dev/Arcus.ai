import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(payload: {id: string, email: string}){
    return jwt.sign(payload, ACCESS_SECRET, {expiresIn: "15min"});
}

export function signRefreshToken(payload: {id: string}){
    return jwt.sign(payload, REFRESH_SECRET, {expiresIn: "7d"});
}

export function verifyAccessToken(token: string){
    try {
        return jwt.verify(token, ACCESS_SECRET) as {id: string, email: string};
    } catch (error) {
        return null;
    }
}

export function verifyRefreshToken(token: string){
    try {
        return jwt.verify(token, REFRESH_SECRET) as {id: string};
    } catch (error) {
        return null;
    }
}