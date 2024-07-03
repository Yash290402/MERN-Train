import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadOncloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been successfully uploaded
        console.log("file is successfully uploaded", response.url);

        fs.unlinkSync(localFilePath)

        return response
    } catch (error) {

        console.error("Error uploading to Cloudinary:", error);

        // Ensure local file is deleted even if upload fails
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Error deleting local file:", unlinkError);
        }
        return null
    }
}

export { uploadOncloudinary }