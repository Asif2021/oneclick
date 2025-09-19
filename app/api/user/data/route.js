import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// this is api to get user data
export async function GET(request){
    try {
        // integrate the api with frontend part
        // pending code here
        const {userId} = getAuth(request)
        await connectDB()
        const user = await User.findById(userId)
        if (!user){
            return NextResponse.json({success: false, message: "user not found"})
            }
        return NextResponse.json({success: true, user})
    } catch (error) {
                    return NextResponse.json({success: false, message: error.message})
    }
}