import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userscehma = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    password: {
        type: String,
        required: true,

    },

    refreshToken :{
        type: String,
    },

    accessToken:{
        type: String,
    },

    avatar:{
        type:String,
        required: true,
    }

},
    {
        timestamps: true,
    }
)

//hashing function for bcrypt
userscehma.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


// for check password
userscehma.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}


userscehma.method.genrateAccessToken = function () {

    return jwt.sign({
        _id: this._id,
        email: this.email,
    },

        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY_KEY
        }
    )
}


userscehma.method.genraterefreshToken = function () {

    return jwt.sign({
        _id: this._id,
    },

        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY_KEY
        }
    )
}






export const User = mongoose.model("User", userscehma)