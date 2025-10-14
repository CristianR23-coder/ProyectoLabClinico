import { Router } from "express";
import { OrderItemController } from "../controllers/orderitem-controller";
import { authMiddleware } from "../middleware/auth";

export class OrderItemRoutes {
	public orderItemController: OrderItemController = new OrderItemController();

	public routes(app: Router): void {
		app.route("/api/orderitems/public").get(this.orderItemController.getAllOrderItems.bind(this.orderItemController));
		app.route("/api/orderitem/:id/public").get(this.orderItemController.getOrderItemById.bind(this.orderItemController));
		app.route("/api/orderitem/public").post(this.orderItemController.createOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id/public").patch(this.orderItemController.updateOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id/public").delete(this.orderItemController.deleteOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id/logic/public").patch(this.orderItemController.deleteOrderItemAdv.bind(this.orderItemController));
		
		// Rutas protegidas con middleware de autenticación
		app.route("/api/orderitems").get(authMiddleware, this.orderItemController.getAllOrderItems.bind(this.orderItemController));
		app.route("/api/orderitem/:id").get(authMiddleware, this.orderItemController.getOrderItemById.bind(this.orderItemController));
		app.route("/api/orderitem").post(authMiddleware, this.orderItemController.createOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id").patch(authMiddleware, this.orderItemController.updateOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id").delete(authMiddleware, this.orderItemController.deleteOrderItem.bind(this.orderItemController));
		app.route("/api/orderitem/:id/logic").patch(authMiddleware, this.orderItemController.deleteOrderItemAdv.bind(this.orderItemController));
	}
}
