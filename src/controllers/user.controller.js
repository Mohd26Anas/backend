import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken'



const generateRefreshAndAccessToken=async(userId)=>{

  const user = await User.findById(userId);
  const accessToken = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken=refreshToken;

  await user.save({validateBeforeSave:false});
  return {accessToken,refreshToken}

}

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

const login = asynHandler(async(req,res)=>{
  console.log(req.body);

  const {email,username,password}=req.body;

  if(!(email)){
    throw new ApiError(400,"Email or username is required");
  }
     const  user = await User.findOne({
        $or:[{email},{username}]
      })

      if(!user){
        return res.status(404).json(new ApiResponse(404,{email,password}, "User not found"));
      }

      const isPasswordCorrect = await user.isPasswordCorrect(password);

      if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials");
      }

      const {accessToken,refreshToken} = await generateRefreshAndAccessToken(user?._id);

      const loggedInUser = await User.findById(user?._id).select("-password -refreshToken");

      const options={
        httpOnly:true,
        secure:true
      }

      return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully"));

})


const logOut =asynHandler(async(req,res)=>{
  console.log(req.user);
 await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:undefined}},{new:true})
 const options={
  httpOnly:true,
  secure:true
}
return res.status(200).clearCookie("accessToken",options).json(new ApiResponse(200,{},"User logged out successfully"))


})

const refreshToken= asynHandler(async(req,res)=>{

  const incomingRefreshToken=req?.cookies?.refreshToken ||req.body?.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401,"Refresh token is required");
  }
  try{
    const decodeToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user= await User.findById(decodeToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh token");
    }
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"Invalid refresh token");
    }
    const {accessToken,refreshToken}= await generateRefreshAndAccessToken(user?._id);

    const options={
      httpOnly:true,
      secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken},"Refresh token created successfully"));

  }catch(error){
    throw new ApiError(401,"Invalid refresh token");
  }
})


export {registerUser,login,logOut,refreshToken}