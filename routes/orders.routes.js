import express from "express";
import fs from "fs";

const router = express.Router();
const DB_PATH = "./db.json";

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// CREATE ORDER
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const db = readDB();

  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.stock === 0 || quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const totalAmount = product.price * quantity;

  const order = {
    id: db.orders.length + 1,
    productId,
    quantity,
    totalAmount,
    status: "placed",
    createdAt: new Date().toISOString().slice(0, 10)
  };

  product.stock -= quantity;
  db.orders.push(order);

  writeDB(db);
  res.status(201).json(order);
});

// GET ALL ORDERS
router.get("/", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// CANCEL ORDER (SOFT DELETE)
router.delete("/:orderId", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === Number(req.params.orderId));

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "cancelled") {
    return res.status(400).json({ message: "Already cancelled" });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (order.createdAt !== today) {
    return res.status(400).json({ message: "Cancellation not allowed" });
  }

  order.status = "cancelled";

  const product = db.products.find(p => p.id === order.productId);
  product.stock += order.quantity;

  writeDB(db);
  res.json(order);
});

// CHANGE STATUS
router.patch("/change-status/:orderId", (req, res) => {
  const { status } = req.body;
  const db = readDB();

  const order = db.orders.find(o => o.id === Number(req.params.orderId));
  if (!order) return res.status(404).json({ message: "Order not found" });

  const flow = ["placed", "shipped", "delivered"];
  const currentIndex = flow.indexOf(order.status);
  const nextIndex = flow.indexOf(status);

  if (order.status === "cancelled" || order.status === "delivered") {
    return res.status(400).json({ message: "Status cannot be changed" });
  }

  if (nextIndex !== currentIndex + 1) {
    return res.status(400).json({ message: "Invalid status flow" });
  }

  order.status = status;
  writeDB(db);
  res.json(order);
});

export default router;
