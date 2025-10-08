import { Router } from "express";
import { OrderItemController } from "../controllers/orderitem-controller";

export class OrderItemRoutes {
	public orderItemController: OrderItemController = new OrderItemController();

	public routes(app: Router): void {
		app.route("/api/orderitems").get(this.orderItemController.getAllOrderItems);
		// app.route("/api/orderitem/:id").get(this.orderItemController.getOrderItemById);
	}
}
