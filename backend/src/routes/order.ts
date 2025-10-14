import { Router } from "express";
import { OrderController } from "../controllers/order-controller";
import { authMiddleware } from "../middleware/auth";

export class OrderRoutes {
	public orderController: OrderController = new OrderController();

	public routes(app: Router): void {
		app.route("/api/ordenes/public").get(this.orderController.getAllOrders.bind(this.orderController));
		app.route("/api/orden/:id/public").get(this.orderController.getOrderById.bind(this.orderController));
		app.route("/api/orden/public").post(this.orderController.createOrder.bind(this.orderController));
		app.route("/api/orden/:id/public").patch(this.orderController.updateOrder.bind(this.orderController));
		app.route("/api/orden/:id/public").delete(this.orderController.deleteOrder.bind(this.orderController));
		app.route("/api/orden/:id/logic/public").patch(this.orderController.deleteOrderAdv.bind(this.orderController));
		
		// Rutas protegidas con middleware de autenticación
		app.route("/api/ordenes").get(authMiddleware, this.orderController.getAllOrders.bind(this.orderController));
		app.route("/api/orden/:id").get(authMiddleware, this.orderController.getOrderById.bind(this.orderController));
		app.route("/api/orden").post(authMiddleware, this.orderController.createOrder.bind(this.orderController));
		app.route("/api/orden/:id").patch(authMiddleware, this.orderController.updateOrder.bind(this.orderController));
		app.route("/api/orden/:id").delete(authMiddleware, this.orderController.deleteOrder.bind(this.orderController));
		app.route("/api/orden/:id/logic").patch(authMiddleware, this.orderController.deleteOrderAdv.bind(this.orderController));
	}
}
