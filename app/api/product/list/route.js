import Product from "@/models/Product";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";


export async function GET(request) {
    try {
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