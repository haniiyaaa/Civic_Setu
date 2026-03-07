import express from "express";
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");

import { uploadImage } from "../controllers/report.controller.js";

// Image upload route
router.post("/upload", upload.single("file"), uploadImage);

export default router;