import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js"



const uploadFileApi= asynHandler(async(req,res)=>{

    await upload.fields([
        {
          name: "avatar",
          maxCount: 1,
        },
       
    ])
    const image = await uploadFile(req.files?.avatar[0]?.path);

    if(!image?.url){
        throw new ApiError(400,"File not uploaded");
    }

    
       return  res.status(200).json(new ApiResponse(200,"File uploaded successfully"));
    

})




export {uploadFileApi}