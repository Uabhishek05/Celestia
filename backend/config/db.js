import mongoose from "mongoose";

let retryTimer = null;
let lastErrorMessage = "";

function getReadyStateLabel(readyState) {
  switch (readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  return {
    configured: Boolean(process.env.MONGODB_URI),
    ready: isDbReady(),
    state: getReadyStateLabel(mongoose.connection.readyState),
    error: lastErrorMessage || null
  };
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri);
  lastErrorMessage = "";
  console.log("MongoDB connected");
  return mongoose.connection;
}

export function startDbConnectionWithRetry({ retryDelayMs = 5000 } = {}) {
  const scheduleRetry = () => {
    if (retryTimer) {
      return;
    }

    retryTimer = setTimeout(() => {
      retryTimer = null;
      void attemptConnection();
    }, retryDelayMs);
  };

  const attemptConnection = async () => {
    if (!process.env.MONGODB_URI) {
      lastErrorMessage = "MONGODB_URI is missing";
      console.error("MongoDB unavailable: MONGODB_URI is missing");
      scheduleRetry();
      return;
    }

    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    try {
      await connectDb();
    } catch (error) {
      lastErrorMessage = error.message;
      console.error(`MongoDB connection failed: ${error.message}`);
      scheduleRetry();
    }
  };

  mongoose.connection.on("disconnected", () => {
    if (process.env.MONGODB_URI) {
      lastErrorMessage = "MongoDB disconnected";
      console.warn("MongoDB disconnected. Retrying connection...");
      scheduleRetry();
    }
  });

  mongoose.connection.on("error", (error) => {
    lastErrorMessage = error.message;
  });

  void attemptConnection();
}
