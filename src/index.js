import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './database/db.js'

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000)
        console.log(`Server started on port ${process.env.PORT}`);
    })

    .catch((err) => {
        console.log("MONGO ERROR: " + err);
    })
