// we are using cloudinary for files , we will first upload te file on our local server then we will take its path and will upload on cloudinary and remove it from local server

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "process.env.CLOUD_NAME",
  api_key: "process.env.API_KEY",
  api_secret: "process.env.API_SECRET",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("File uploaded", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };

//CLOUDINARY_URL=cloudinary://359988818314461:**********@davpsqxuz
