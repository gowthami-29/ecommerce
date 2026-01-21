import express from "express";
import productsRouter from "./routes/products.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";

const app = express();
app.use(express.json());

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/analytics", analyticsRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
