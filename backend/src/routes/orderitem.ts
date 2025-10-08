import { Router } from "express";
import { OrderItemController } from "../controllers/orderitem-controller";

export class OrderItemRoutes {
	public orderItemController: OrderItemController = new OrderItemController();

	public routes(app: Router): void {
		app.route("/orderitems").get(this.orderItemController.getAllOrderItems);
		// app.route("/orderitem/:id").get(this.orderItemController.getOrderItemById);
	}
}
