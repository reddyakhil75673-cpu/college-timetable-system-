import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./server/routes.ts";
import { Users } from "./server/db.ts";
import { seedDatabase } from "./server/seed.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up CORS
  app.use(cors());
  app.use(express.json());

  // Automatically seed database if empty
  try {
    const existingUsers = Users.find();
    if (existingUsers.length === 0) {
      console.log("No users found in database. Automatically running seed...");
      await seedDatabase();
    } else {
      console.log(`Database already has ${existingUsers.length} users. Skipping auto-seed.`);
    }
  } catch (err) {
    console.error("Failed to seed database on startup:", err);
  }

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "College Timetable & Academic Management System API is live" });
  });

  // API Routes
  app.use("/api", apiRoutes);

  // Manual seed endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: "Database seeded successfully!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`College Timetable Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
