import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//this will handle the post request to the api
export async function POST(request){
    try {
        const {userId} = getAuth(request);
    //function to confirm user is seller or not
        const isSeller = await authSeller(userId);
    // if user is not seller then user will not allow to add product
        if(!isSeller){
            return NextResponse.json({success: false, message: "Not Authorized"})
        }
    // if user is seller then we will get the formdata from the request
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");
    // check if files are not present we will return NextResponse
    if(!files || files.length === 0){
        return NextResponse.json({success:false, message: "No files uploaded"})
    }
    // if files are present then we will upload the files to cloudinary and save the urls in result
    const result = await Promise.all(
        files.map(async (file)=>{
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {resource_type: "auto"},
                    (error, result)=>{
                        if(error){
                            reject(error)
                        } else {
                            resolve(result)
                        }
                    }
                )
            stream.end(buffer);
            })
        })
    )
    const image = result.map((result)=>(result.secure_url))
    await connectDB();
    const newProduct = await Product({
        userId,
        name,
        description,
        category,
        // we are getting data from formdata, the number will be converted to string so we need to convert it back to number
        price: Number(price),
        offerPrice: Number(offerPrice),
        image,
        date: Date.now(),
    })
    return NextResponse.json({success: true, message: "Product uploaded successfully", newProduct})
    } catch (error) {
     return NextResponse.json({success:false, message: error.message})
    }
}