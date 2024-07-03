import { Feedback } from '../model/feedback.model.js';

const feedback = async (req, res) => {

    console.log('server received feedback');

    const { name, email, message } = req.body;
    console.log(name, email, message);

    // validate input fields
    if ([name, email, message].some(field => field && field.trim() === '')) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingFeedback = await Feedback.findOne({ email });

        if (existingFeedback) {
            return res.status(409).json({
                error: "Feedback with this email already exists"
            });
        }

        // create new feedback
        const newFeedback = await Feedback.create({
            name,
            email,
            message
        });

        return res.status(200).json({
            success: true,
            data: newFeedback,
            message: "Feedback form is submitted successfully"
        });

    } catch (error) {
        console.log("error submitting form ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    feedback
};
