import { Router } from "express";
import { OrderController } from "../controllers/order-controller";

export class OrderRoutes {
	public orderController: OrderController = new OrderController();

	public routes(app: Router): void {
			app.route("/api/ordenes").get(this.orderController.getAllOrders).post(this.orderController.createOrder);
			// app.route("/api/orden/:id").get(this.orderController.getOrderById);
	}
}
