import { Router } from "express";
import { OrderController } from "../controllers/order-controller";

export class OrderRoutes {
	public orderController: OrderController = new OrderController();

	public routes(app: Router): void {
		app.route("/ordenes").get(this.orderController.getAllOrders);
		// app.route("/orden/:id").get(this.orderController.getOrderById);
	}
}
