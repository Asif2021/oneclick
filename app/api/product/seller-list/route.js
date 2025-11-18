import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";


export async function GET(request) {
    try {
        // getting user id from the request
        const { userId } = getAuth(request);

        // check if the user is seller
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({
                success: false,
                message: "Not Authorized",
            });
        }
        // if user is seller then fetch his products from db
        await connectDB();
        const products = await Product.find({})
        return NextResponse.json({
            success: true,
            products,
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}