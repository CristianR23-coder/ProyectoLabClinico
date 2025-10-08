import { Request, Response } from "express";
import { OrderItem, OrderItemI } from "../database/models/OrderItem";

export class OrderItemController {
  // Obtener todos los ítems de orden que no estén anulados
  public async getAllOrderItems(req: Request, res: Response) {
    try {
      const orderItems: OrderItemI[] = await OrderItem.findAll({
        where: {
          status: "ACTIVE",
          state: [
            "PENDIENTE",
            "TOMADO",
            "EN_PROCESO",
            "VALIDADO",
            "ENTREGADO"
          ]
        },
      });
      res.status(200).json({ orderItems });
    } catch (error) {
      res.status(500).json({ error: "Error fetching order items" });
    }
  }

  // Obtener un ítem de orden por ID
  public async getOrderItemById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const orderItem = await OrderItem.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
          state: [
            "PENDIENTE",
            "TOMADO",
            "EN_PROCESO",
            "VALIDADO",
            "ENTREGADO"
          ]
        },
      });
      if (orderItem) {
        res.status(200).json(orderItem);
      } else {
        res.status(404).json({ error: "Order item not found or annulled" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching order item" });
    }
  }
}
