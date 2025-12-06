// server.js
import app from "./app.js";
import mongoose from "mongoose";
import os from "os";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Handle invalid JSON (moved from app.js to ensure it's after body parsing)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("❌ Invalid JSON in request body");
    return res.status(400).json({ 
      success: false,
      message: "Invalid JSON format in request body" 
    });
  }
  next(err);
});

// Final error handler
app.use((err, req, res, next) => {
  // Don't log stack trace in production
  if (process.env.NODE_ENV !== 'production') {
    console.error("❌ Error:", err.stack);
  } else {
    console.error("❌ Error:", err.message);
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const HOST = process.env.HOST || '0.0.0.0';

// Get network interfaces for better logging
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
};

app.listen(PORT, HOST, () => {
  const networkIPs = getNetworkInfo();
  
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
  
  if (networkIPs.length > 0) {
    console.log(`\n🌐 Network Access URLs:`);
    networkIPs.forEach(ip => {
      console.log(`   http://${ip}:${PORT}/api/v1`);
    });
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});
