import Report from "../models/report.js";

const rateLimitReports = async (req, res, next) => {

  try {

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const reportsToday = await Report.countDocuments({
      userId: req.user.id,
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    if (reportsToday >= 3) {
      return res.status(429).json({
        message: "You can only submit 3 reports per day"
      });
    }

    next();

  } catch (error) {

    console.error("Rate limit check failed:", error);

    res.status(500).json({
      message: "Error checking report limit"
    });

  }

};

export default rateLimitReports;