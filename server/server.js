const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const passport = require("./config/passport");

const session = require("express-session");

const app = express();

app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Routes
app.use("/api/tryon", require("./routes/tryon"));
app.use("/api/seller", require("./routes/seller").router);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/reviews", require("./routes/reviews"));
app.use('/api/support', require('./routes/support'));
app.use('/api/fabric', require('./routes/fabric'))
app.use("/api/customer", require("./routes/customer").router);
app.use("/widget.js", express.static("./widget/widget.js"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server chal raha hai! ✅" });
});

// MongoDB connect
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/virtual-tryon";

const normalizeMongoUri = (uri) => {
  if (!uri) return uri;
  let normalized = uri.trim();

  // Atlas SRV needs a database name in some setups.
  if (
    normalized.startsWith("mongodb+srv://") &&
    normalized.match(/mongodb\.net\/(\?.*)?$/)
  ) {
    normalized = normalized.replace(
      /mongodb\.net\/(\?.*)?$/,
      "mongodb.net/virtual-tryon$1",
    );
  }

  return normalized;
};

const MONGO_URI = normalizeMongoUri(MONGODB_URI);

const setFallbackDns = () => {
  if (!MONGO_URI.startsWith("mongodb+srv://")) return;

  try {
    const fallbackServers = ["8.8.8.8", "8.8.4.4"];
    dns.setServers(fallbackServers);
    console.log(
      "Using fallback DNS servers for SRV lookup:",
      fallbackServers.join(", "),
    );
  } catch (error) {
    console.warn("Could not set fallback DNS servers:", error.message);
  }
};

const startServer = async () => {
  setFallbackDns();

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "MongoDB URI:",
      MONGO_URI.replace(/(mongodb\+srv:\/\/.*:).*@(.*)/, "$1******@$2"),
    );
    console.error(
      "If you are using Atlas, make sure your cluster allows your IP and DNS SRV lookups.",
    );
    console.error(
      "If you want to run locally, set MONGODB_URI=mongodb://127.0.0.1:27017/virtual-tryon",
    );
    process.exit(1);
  }

  const keepAlive = () => {
    const url = process.env.BACKEND_URL;
    if (url && process.env.NODE_ENV === "production") {
      setInterval(
        async () => {
          try {
            await fetch(`${url}/`);
            console.log("✅ Keep alive ping sent!");
          } catch (error) {
            console.log("Keep alive error:", error.message);
          }
        },
        14 * 60 * 1000,
      ); // Har 14 minute
    }
  };
  app.listen(PORT, () => {
    console.log(`🚀 Server ready: http://localhost:${PORT}`);
    keepAlive();
  });
};

startServer();
