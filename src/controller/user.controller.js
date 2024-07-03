import { User } from "../model/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { asynchandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIResponse } from "../utils/APIresponse.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";




const genrateAccessTokenandrefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);

        const accessToken = jwt.sign({
            _id: user._id,
            email: user.email,
        },

            process.env.ACCESS_TOKEN_SECRET_KEY,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY_KEY
            }
        )

        const refreshToken = jwt.sign({
            _id: user._id,
        },

            process.env.REFRESH_TOKEN_SECRET_KEY,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY_KEY
            }
        )


        user.refreshToken = refreshToken

        user.accessToken = accessToken

        await user.save()

        return { accessToken, refreshToken }

    } catch (error) {
        console.error(error);
    }
}

const registerUser = async (req, res) => {

    const { username, email, password } = req.body;

    console.log(req.files);

    if ([username, email, password].every((f) => f?.trim() === "")) {
        res.status(400).json({ error: "All fields are required" });
    }

    try {
        const exist = await User.findOne({ email: email });

        if (exist) {
            res.status(400).json({ error: "User already exists" })

        }

        const avatarlocalPath = req.files?.avatar[0]?.path

        if (!avatarlocalPath) {
            throw new APIerror(400, "avatar not found")
        }

        const avatar = await uploadOncloudinary(avatarlocalPath)

        if (!avatar) {
            throw new APIerror(400, "Avatar is required")
        }

        const newuser = await User.create({
            username,
            email,
            password,
            avatar: avatar.url
        });

        const user = await User.findById(newuser._id)

        if (!user) {
            res.status(400).json({ error: "something is wrong" });
        }


        return res.status(200).json({
            message: "User created successfully",
            data: user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


const login = asynchandler(async (req, res) => {

    const { email, password } = req.body;

    console.log(password);

    if (!email) {
        res.status(400).json({ error: "email,password not provided" })
    }

    const user = await User.findOne({
        $or: [{ email }, { password }]
    })

    if (!user) {
        res.status(404).json({ error: "User not found" })
    }

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
        res.status(400).json({ error: "invalid password" })
    }


    const { accessToken, refreshToken } = await genrateAccessTokenandrefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(200,
            {
                user: loggedInUser, accessToken, refreshToken
            }
            , "user logged in successfully"
        )

})


const logout = async (req, res) => {


    await User.findOneAndUpdate(

        {
            _id: req.user._id,
        },

        {
            $set: {
                refreshToken: undefined,
            }
        },

        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(200, {}, "user logout successfully");
}


const changePassword = asynchandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new APIerror(400, "Invalid password")
    }

    user.password = newPassword
    user.save()

    return res
        .status(200)
        .json(new APIResponse(200, {}, "password changed successfully"))
})


const getcurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new APIResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asynchandler(async (req, res) => {

    const { username, email } = req.body

    if (!username || !email) {
        throw new APIerror(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new APIResponse(200, user, "Aaccount updated"))
})

const refreshAccessToken = asynchandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new APIerror(401, "unauthenticated")
    }

    try {
        const decodetoken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET_KEY
        )

        const user = await User.findById(decodetoken?._id)

        if (!user) {
            throw new APIerror(400, "invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIerror(401, "Refresh token is expired or used")
        }

        const { accessToken, newrefreshToken } = await genrateAccessTokenandrefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {
                        accessToken, refreshToken: newrefreshToken
                    },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new APIerror(401, error?.message || "invlaid refresh token")
    }
})






export {
    registerUser,
    login,
    logout,
    changePassword,
    getcurrentUser,
    updateAccountDetails,
    refreshAccessToken
}