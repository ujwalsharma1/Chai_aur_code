//require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import connectDb from "./db/db.js";

connectDb()
.then( () => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    })
})
.catch((error) => {
    console.log("Mongo DB connection Error :", error);
    process.exit(1);
});