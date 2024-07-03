import mongoose, { Schema } from "mongoose";

// Feedback Schema


const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
},{
    timestamps: true,
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);