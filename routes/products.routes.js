import express from "express";
import fs from "fs";

const router = express.Router();
const DB_PATH = "./db.json";

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

router.post("/", (req, res) => {
  const db = readDB();
  const newProduct = {
    id: db.products.length + 1,
    ...req.body
  };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

router.get("/", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

export default router;
