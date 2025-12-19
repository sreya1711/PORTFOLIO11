require("dotenv").config();

const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const Contact = require("./mongo");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Fix Cannot GET /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Contact route (SAVE JWT IN DB)
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required"
    });
  }

  try {
    // Generate JWT
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save to MongoDB (token included)
    const contact = await Contact.create({
      name,
      email,
      message,
      token
    });

    res.status(201).json({
      status: "success",
      message: "Message saved successfully",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
