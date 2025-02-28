import cors from "cors";
import { dbConnetion } from "./Database/DBConnection/dbConnection.js";
import { userRouter } from "./Modules/User/user.controller.js";
import { globalErrorHandling } from "./utils/ErrorHandling/errorHandling.js";
import { companyRouter } from "./Modules/Company/company.controller.js";
import { jobRouter } from "./Modules/Jobs/job.controller.js";
import { applicationRouter } from "./Modules/application/application.controller.js";
import { adminRouter } from "./Modules/admin/admin.controller.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
const limiter = rateLimit({
  limit: 5,
  windowMs: 60 * 1000,
  handler: (req, res, next) => {
    return next(
      new Error("Too many requests. Please slow down and try again later.", {
        cause: 429,
      })
    );
  },
});
export const bootstrap = async (app, express) => {
  // Data parsing middleware
  app.use(express.json());
  app.use(limiter);
  app.use(helmet());

  // cors middleware
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  // Database Connection
  await dbConnetion();
  // Routes
  app.use("/user", userRouter);
  app.use("/company", companyRouter);
  app.use("/job", jobRouter);
  app.use("/application", applicationRouter);
  app.use("/admin", adminRouter);

  // Not Found Page
  app.use("*", (req, res) => {
    return res.status(404).json({ msg: "Not Found Page!" });
  });
  app.use(globalErrorHandling);
};
