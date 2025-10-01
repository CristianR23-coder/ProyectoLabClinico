import { Request, Response } from "express";
import { Order, OrderI } from "../database/models/Order";

export class OrderController {
  // Obtener todas las órdenes con estado lógico "ACTIVE" y que no estén anuladas
  public async getAllOrders(req: Request, res: Response) {
    try {
      const orders: OrderI[] = await Order.findAll({
        where: {
          status: "ACTIVE",
          state: [
            "CREADA",
            "TOMADA",
            "EN_PROCESO",
            "VALIDADA",
            "ENTREGADA"
          ]
        },
      });
      res.status(200).json({ orders });
    } catch (error) {
      res.status(500).json({ error: "Error fetching orders" });
    }
  }

  // Obtener una orden por ID
  public async getOrderById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const order = await Order.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
          state: [
            "CREADA",
            "TOMADA",
            "EN_PROCESO",
            "VALIDADA",
            "ENTREGADA"
          ]
        },
      });
      if (order) {
        res.status(200).json(order);
      } else {
        res.status(404).json({ error: "Order not found or annulled/inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching order" });
    }
  }
}
