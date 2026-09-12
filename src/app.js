import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// used to handle CORS error when frontend and backend are running on different ports
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

// used to parse incoming request body (forms data) in JSON format
app.use(express.json({ limit: "16kb" }));

// Parse incoming form data (from HTML forms) and make it available in req.body
// `extended: true` allows parsing of complex/nested objects
app.use(express.urlencoded({ extended: true }));

// Serve static files (like HTML, CSS, JS, images) from the "public" folder
app.use(express.static("public"));

// Parse cookies from incoming requests and make them available in req.cookies
// Useful for sessions, authentication, etc.
app.use(cookieParser());

//Routes
import userRouter from "./Routes/user.route.js";

app.use("/api/v1/users", userRouter);
console.log("Hi");

export { app };
