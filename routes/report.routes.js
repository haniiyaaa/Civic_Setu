import express from "express";
//import router from "express-promise-router";
const router = express.Router();
import upload from "../middleware/multer.js";
import { createReport } from "../controllers/report.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";



// report upload route
router.post("/citizen/reportupload",authMiddleware,upload.array("media", 5),createReport
);
export default router;