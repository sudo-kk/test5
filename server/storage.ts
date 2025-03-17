import {
  User, InsertUser,
  Category, InsertCategory, 
  Product, InsertProduct,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  CartItem, InsertCartItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// Helper function to hash passwords
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Extended type for cart items with product details
export type CartItemWithProduct = CartItem & {
  product: Product;
  total: number;
};

// Extended type for orders with items
export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

// Type for admin dashboard stats
export type AdminStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: OrderWithItems[];
};

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Cart methods
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: number, productId: number): Promise<boolean>;
  clearCart(userId: number): Promise<void>;

  // Order methods
  createOrder(order: InsertOrder, items: { productId: number; quantity: number; price: number }[]): Promise<OrderWithItems>;
  getUserOrders(userId: number): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<OrderWithItems[]>;
  getOrderById(id: number): Promise<OrderWithItems | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Admin stats
  getAdminStats(): Promise<AdminStats>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private cartItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.cartItemIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Hash password if it's not already hashed (contains a dot separator)
    const password = insertUser.password.includes('.') 
      ? insertUser.password 
      : await hashPassword(insertUser.password);
    
    const user: User = { ...insertUser, id, password };
    this.users.set(id, user);
    return { ...user, password: "[FILTERED]" } as User; // Don't return the actual password
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === category.id
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, insertProduct: InsertProduct): Promise<Product | undefined> {
    if (!this.products.has(id)) return undefined;
    
    const updatedProduct: Product = { ...insertProduct, id };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    return await Promise.all(
      cartItems.map(async (item) => {
        const product = await this.getProductById(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
        return {
          ...item,
          product,
          total: product.price * item.quantity
        };
      })
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if product exists
    const product = await this.getProductById(insertCartItem.productId);
    if (!product) throw new Error("Product not found");
    
    // Check if the product is already in the cart
    const existingCartItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingCartItem) {
      // Update quantity instead of adding a new item
      return this.updateCartItemQuantity(
        insertCartItem.userId,
        insertCartItem.productId,
        existingCartItem.quantity + insertCartItem.quantity
      ) as Promise<CartItem>;
    }
    
    const id = this.cartItemIdCounter++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(cartItem.id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(userId: number, productId: number): Promise<boolean> {
    const cartItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (!cartItem) return false;
    
    return this.cartItems.delete(cartItem.id);
  }

  async clearCart(userId: number): Promise<void> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    for (const item of userCartItems) {
      this.cartItems.delete(item.id);
    }
  }

  // Order methods
  async createOrder(
    insertOrder: InsertOrder,
    items: { productId: number; quantity: number; price: number }[]
  ): Promise<OrderWithItems> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { ...insertOrder, id, createdAt: now };
    this.orders.set(id, order);
    
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const orderItemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = {
        id: orderItemId,
        orderId: id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      };
      this.orderItems.set(orderItemId, orderItem);
      orderItems.push(orderItem);
    }
    
    return this.getOrderById(id) as Promise<OrderWithItems>;
  }

  async getUserOrders(userId: number): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
    
    return await Promise.all(
      orders.map(order => this.getOrderById(order.id) as Promise<OrderWithItems>)
    );
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values());
    
    return await Promise.all(
      orders.map(order => this.getOrderById(order.id) as Promise<OrderWithItems>)
    );
  }

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id
    );
    
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await this.getProductById(item.productId);
        return { ...item, product: product! };
      })
    );
    
    return { ...order, items: itemsWithProducts };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Admin stats
  async getAdminStats(): Promise<AdminStats> {
    const orders = await this.getAllOrders();
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = this.products.size;
    const totalCustomers = Array.from(this.users.values()).filter(user => !user.isAdmin).length;
    
    // Get recent orders, sorted by date
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    };
  }
}

export const storage = new MemStorage();
