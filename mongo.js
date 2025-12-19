require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },

    // ✅ ADD TOKEN FIELD
    token: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
