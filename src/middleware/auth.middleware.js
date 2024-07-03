import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";


export const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if (!token) {
            res.status(403).json({ message: "invalid access token" })
        }

        const decodetoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY)

        console.log('decode token', decodetoken);

        const user = await User.findById(decodetoken?._id).select("-password -refreshToken")

        console.log("user object", user);

        req.user = user
        next()
    } catch (error) {
       res.status(403).json({message:"invalid request "})
    }
}

