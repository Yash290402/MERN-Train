import express from "express";
import userRouter from './routes/user.route.js'
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json())

app.use(express.static('frontend'))
app.use(express.static('public'))

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "20kb" }))

app.use(cookieParser())

app.use("/api/v1/users", userRouter)


export { app }