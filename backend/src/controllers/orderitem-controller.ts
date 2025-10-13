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

  // Create a new order item
  public async createOrderItem(req: Request, res: Response) {
    const { orderId, examId, code, name, price, state, status } = req.body;
    try {
      let body: OrderItemI = {
        orderId,
        examId,
        code,
        name,
        price,
        state,
        status,
      } as OrderItemI;

      const newOrderItem = await OrderItem.create({ ...body } as any);
      res.status(201).json(newOrderItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update an order item
  public async updateOrderItem(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { orderId, examId, code, name, price, state, status } = req.body;
    try {
      let body: OrderItemI = {
        orderId,
        examId,
        code,
        name,
        price,
        state,
        status,
      } as OrderItemI;

      const orderItemExist = await OrderItem.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (orderItemExist) {
        await orderItemExist.update(body as any, { where: { id: pk } });
        res.status(200).json(orderItemExist);
      } else {
        res.status(404).json({ error: "Order item not found or annulled" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete an order item physically
  public async deleteOrderItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderItemToDelete = await OrderItem.findByPk(id);

      if (orderItemToDelete) {
        await orderItemToDelete.destroy();
        res.status(200).json({ message: "Order item deleted successfully" });
      } else {
        res.status(404).json({ error: "Order item not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting order item" });
    }
  }

  // Delete an order item logically (change status to "INACTIVE")
  public async deleteOrderItemAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const orderItemToUpdate = await OrderItem.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (orderItemToUpdate) {
        await orderItemToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Order item marked as inactive" });
      } else {
        res.status(404).json({ error: "Order item not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking order item as inactive" });
    }
  }
}
