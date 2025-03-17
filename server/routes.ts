import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCategorySchema, insertProductSchema, insertCartItemSchema } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia", // Updated to latest version
});

// Middleware to check admin status
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  return res.status(403).send("Unauthorized: Admin access required");
}

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send("Unauthorized: Please login");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).send("Product not found");
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Get products by category
  app.get("/api/categories/:slug/products", async (req, res) => {
    try {
      const { slug } = req.params;
      const products = await storage.getProductsByCategory(slug);
      res.json(products);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Admin: Create product
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      // Validate request body
      const validData = insertProductSchema.parse(req.body);
      
      const product = await storage.createProduct(validData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Server error");
      }
    }
  });

  // Admin: Update product
  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body
      const validData = insertProductSchema.parse(req.body);
      
      const product = await storage.updateProduct(id, validData);
      if (!product) {
        return res.status(404).send("Product not found");
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Server error");
      }
    }
  });

  // Admin: Delete product
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).send("Product not found");
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Admin: Create category
  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      // Validate request body
      const validData = insertCategorySchema.parse(req.body);
      
      const category = await storage.createCategory(validData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Server error");
      }
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const validData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const cartItem = await storage.addToCart(validData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send("Server error");
      }
    }
  });

  app.put("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).send("Invalid quantity");
      }
      
      const cartItem = await storage.updateCartItemQuantity(req.user.id, productId, quantity);
      if (!cartItem) {
        return res.status(404).send("Cart item not found");
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const success = await storage.removeFromCart(req.user.id, productId);
      
      if (!success) {
        return res.status(404).send("Cart item not found");
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      let orders;
      if (req.user.isAdmin) {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getUserOrders(req.user.id);
      }
      res.json(orders);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).send("Order not found");
      }
      
      // Check if user is admin or order belongs to the user
      if (!req.user.isAdmin && order.userId !== req.user.id) {
        return res.status(403).send("Unauthorized");
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Admin: Update order status
  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).send("Invalid status");
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).send("Order not found");
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send("Invalid amount");
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: "inr", // Indian Rupees
        metadata: {
          userId: req.user.id.toString()
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Create order after successful payment
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { total, items } = req.body;
      
      if (!total || typeof total !== 'number' || total <= 0 || !items || !Array.isArray(items)) {
        return res.status(400).send("Invalid order data");
      }
      
      // Create the order
      const order = await storage.createOrder({
        userId: req.user.id,
        total,
        status: 'processing'
      }, items);
      
      // Clear the user's cart after order is placed
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  // Stats for admin dashboard
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Initialize the server with default data
  await initializeData();

  const httpServer = createServer(app);
  return httpServer;
}

// Function to initialize default data
async function initializeData() {
  // Check if admin user exists, if not create one
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      email: "admin@stylehub.com",
      password: "admin123", // This will be hashed in the createUser method
      isAdmin: true
    });
  }

  // Check if categories exist, if not create default ones
  const categories = await storage.getAllCategories();
  if (categories.length === 0) {
    await Promise.all([
      storage.createCategory({ name: "Watches", slug: "watches" }),
      storage.createCategory({ name: "Clothing", slug: "clothing" }),
      storage.createCategory({ name: "Shoes", slug: "shoes" })
    ]);
  }

  // Add some products if none exist
  const products = await storage.getAllProducts();
  if (products.length === 0) {
    // Get category IDs
    const allCategories = await storage.getAllCategories();
    const watchCategory = allCategories.find(c => c.slug === "watches");
    const clothingCategory = allCategories.find(c => c.slug === "clothing");
    const shoesCategory = allCategories.find(c => c.slug === "shoes");

    if (watchCategory) {
      await storage.createProduct({
        name: "Classic Timepiece",
        description: "Elegant watch with leather strap and minimalist design.",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
        categoryId: watchCategory.id,
        stock: 25,
        color: "Black",
        material: "Leather"
      });
    }

    if (clothingCategory) {
      await storage.createProduct({
        name: "Premium Linen Shirt",
        description: "High-quality linen shirt, perfect for summer days.",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1072&q=80",
        categoryId: clothingCategory.id,
        stock: 50,
        color: "White",
        material: "Linen"
      });

      await storage.createProduct({
        name: "Designer Denim Jacket",
        description: "Stylish denim jacket with modern design and comfortable fit.",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80",
        categoryId: clothingCategory.id,
        stock: 30,
        color: "Blue",
        material: "Denim"
      });
    }

    if (shoesCategory) {
      await storage.createProduct({
        name: "Urban Sneakers",
        description: "Comfortable canvas sneakers for everyday urban style.",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
        categoryId: shoesCategory.id,
        stock: 40,
        color: "White",
        material: "Canvas"
      });
    }
  }
}
