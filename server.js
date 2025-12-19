require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

const Contact = require("./mongo");

const app = express();
const PORT = 3000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- SERVE FRONTEND -------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* -------------------- DB CONNECT -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

/* -------------------- HOME ROUTE -------------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -------------------- JWT TOKEN API -------------------- */
app.get("/get-token", (req, res) => {
  const token = jwt.sign(
    { source: "portfolio-frontend" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  res.json({ token });
});

/* -------------------- CONTACT API -------------------- */
app.post("/contact", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newContact = new Contact({
      name,
      email,
      message,
      token
    });

    await newContact.save();

    res.status(201).json({ message: "Message stored successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

/* -------------------- SERVER START -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
