import express from "express";
//import router from "express-promise-router";
const router = express.Router();
import upload from "../middleware/multer.js";
import { createReport } from "../controllers/report.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllReports } from "../controllers/report.controller.js";
import rateLimitReports from "../middleware/rateLimitReports.js";
import { getMyReports } from "../controllers/report.controller.js";
import { getReportDetails } from "../controllers/report.controller.js";
import { deleteReport } from "../controllers/report.controller.js";
import { updateReportStatus } from "../controllers/report.controller.js";



// report upload route
router.post("/citizen/reportupload",authMiddleware,rateLimitReports,upload.array("media", 5),createReport
);
//for admin to view all reports
router.get("/admin/reports", authMiddleware, getAllReports);

//for citizens to view all reports on map
router.get("/citizen/allreports", authMiddleware, getAllReports);

router.get("/citizen/myreports", authMiddleware, getMyReports);

router.get("/admin/getReportDetails/:reportId",authMiddleware,getReportDetails);

router.delete("/admin/deleteReport/:reportId", authMiddleware, deleteReport);

router.patch("/admin/updateStatus/:reportId",authMiddleware,upload.array("proof", 1),updateReportStatus);
export default router;
