import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";



const registerUser = asynHandler(async(req,res)=>{

    const {fullName,email,username,password}=req.body;

    if([fullName,email,username,password].some((fields)=>fields?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }
    const existedUser = await User.findOne({
        $or:[
            {username},
            {email}
        ]
    });
    if(existedUser){
        throw new ApiError(409,"User already exist");
       
    }

    const avatarImage = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    


    if(!avatarImage){
        throw new ApiError(400,"Please upload an avatar image");
    }

  const avatar= await  uploadFile(avatarImage);
  const cover= await  uploadFile(coverImageLocalPath);




  if(!avatar){
    throw new ApiError(400,"Failed to upload avatar image");
  }

 const user =  await User.create({
    fullName,
    email,
    avatar:avatar.url,
    coverImage:cover?.url|| "",
    password,
    username:username.toLowerCase()
  })

  const creatingUser = await User.findById(user?._id).select("-password -refreshToken");

  if(!creatingUser){
    throw new ApiError(400,"Failed to create user");
  }
  return res.status(201).json(new ApiResponse(200,creatingUser,"User created successfully"))
})


export {registerUser}