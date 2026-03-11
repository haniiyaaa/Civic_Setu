import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { configureCloudinary } from "./config/cloudinary.js";
configureCloudinary();
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/report.routes.js";
import userProfileRoutes from "./routes/userProfile.routes.js";





// Connect database
connectDB();

const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/userProfile", userProfileRoutes);

// ================= Routes =================
app.get("/", (req, res) => {
  res.status(200).json({ message: "Civic Setu API is running" });
});

// ================= Server =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});