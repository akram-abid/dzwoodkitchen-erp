import { NextResponse } from "next/server";
import { login } from "@/app/services/userAuthService";

export async function POST(req) {
  try {
    const loginData = await login(await req.json());
    const token = loginData.token;

    const resp = NextResponse.json({loginData}); 

    resp.cookies.set("token", token, {
        httpOnly:true, 
        secure: false, // for the meantime
        sameSite: "lax", 
        path: "/",
        maxAge: 60*60*24*7, // 7DAYS 
    }); 

    return resp; 
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
