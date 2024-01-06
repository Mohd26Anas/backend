import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    avator:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    }, 
     refreshToken:{
        type:String,
    },
    watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
    ]
},{timestamps:true});


userSchema.pre("save", async function  (next){
     if(!this.isModified("password")) return next();
    this.password= bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect= async function(password){
    return  await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User",userSchema)