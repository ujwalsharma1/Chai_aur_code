//require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./db/db.js";

connectDb();