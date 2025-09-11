import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const { type, featured, search } = req.query;
      
      let content;
      
      if (search && typeof search === 'string') {
        content = await storage.searchContent(search);
      } else if (type === 'movie' || type === 'series') {
        content = await storage.getContentByType(type);
      } else if (featured === 'true') {
        content = await storage.getFeaturedContent();
      } else {
        content = await storage.getAllContent();
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const content = await storage.getContentById(id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // User list routes (simplified without authentication for demo)
  app.get("/api/user-list", async (req, res) => {
    try {
      // Use a consistent demo user
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
        console.log("Created new demo user with ID:", user.id);
      }
      
      const contentIds = await storage.getUserList(user.id);
      const content = [];
      
      for (const contentId of contentIds) {
        const item = await storage.getContentById(contentId);
        if (item) {
          content.push(item);
        }
      }
      
      res.json(content);
    } catch (error) {
      console.error("GET /api/user-list error:", error);
      res.status(500).json({ message: "Failed to fetch user list" });
    }
  });

  app.post("/api/user-list", async (req, res) => {
    try {
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }
      
      // Use the same consistent demo user
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      // Check if content exists
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Check if already in list
      const isInList = await storage.isInUserList(user.id, contentId);
      if (isInList) {
        return res.status(400).json({ message: "Content already in list" });
      }
      
      const userList = await storage.addToUserList(user.id, contentId);
      res.json(userList);
    } catch (error) {
      console.error("POST /api/user-list error:", error);
      res.status(500).json({ message: "Failed to add content to list" });
    }
  });

  app.delete("/api/user-list/:contentId", async (req, res) => {
    try {
      const contentId = req.params.contentId;
      
      if (!contentId) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Use the same consistent demo user
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      const removed = await storage.removeFromUserList(user.id, contentId);
      if (!removed) {
        return res.status(404).json({ message: "Content not found in list" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove content from list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
