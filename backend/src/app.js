const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const todoRoutes = require("./routes/todo.route");
const authRoute = require("./routes/user.route");
const dbConnection = require("./config/db");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Ensure database is connected before handling any route
app.use(async (req, res, next) => {
  await dbConnection();
  next();
});

app.use("/api/auth", authRoute);
app.use("/api/todos", authMiddleware, todoRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = app;

