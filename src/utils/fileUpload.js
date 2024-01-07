import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (file) => {
    try {
    
  
      if (!file) {
        throw new Error("File not provided");
      }
  
      const response = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
  
      fs.unlinkSync(file);
  
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
  
     
        fs.unlinkSync(file);
      
  
      return null;
    }
  };
  
export {uploadFile}