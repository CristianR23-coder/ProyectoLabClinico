import { Request, Response } from "express";
import { Order, OrderI } from "../database/models/Order";
import { PatientInsurance } from "../database/models/PatientInsurance";
import { Patient } from "../database/models/Patient";
import { Insurance } from "../database/models/Insurance";

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
        include: [
          { model: Patient, attributes: ["id", "firstName", "lastName"] },
          { model: Insurance, attributes: ["id", "name"] },
        ],
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
        include: [
          { model: Patient, attributes: ["id", "firstName", "lastName"] },
          { model: Insurance, attributes: ["id", "name"] },
        ],
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

  // Crear una nueva orden: la aseguradora (insuranceId) se toma desde patient_insurances
  public async createOrder(req: Request, res: Response) {
    try {
      const { patientId, doctorId, orderDate, priority, observations, netTotal, insuranceId: requestedInsuranceId } = req.body;

      if (!patientId) {
        return res.status(400).json({ error: "patientId is required" });
      }

      // comprobar que el paciente exista
      const patient = await Patient.findOne({ where: { id: patientId } });
      if (!patient) return res.status(404).json({ error: "Patient not found" });

      let finalInsuranceId: number | null = null;

      if (requestedInsuranceId) {
        // Si el cliente envía insuranceId, validar que pertenezca al paciente y esté ACTIVE
        const valid = await PatientInsurance.findOne({
          where: { patientId, insuranceId: requestedInsuranceId, status: "ACTIVE" },
        });
        if (!valid) {
          return res.status(400).json({ error: "La aseguradora indicada no pertenece al paciente o no está activa" });
        }
        finalInsuranceId = requestedInsuranceId;
      } else {
        // No fue enviada: usar la aseguradora activa del paciente si existe
        const patIns = await PatientInsurance.findOne({
          where: { patientId, status: "ACTIVE" },
          order: [["startDate", "DESC"]],
        });
        finalInsuranceId = patIns ? patIns.insuranceId : null;
      }

      const ord = await Order.create({
        orderDate: orderDate ?? new Date(),
        state: "CREADA",
        priority: priority ?? "RUTINA",
        patientId,
        doctorId: doctorId ?? null,
        insuranceId: finalInsuranceId,
        netTotal: netTotal ?? 0,
        observations: observations ?? null,
        status: "ACTIVE",
      } as any);

      res.status(201).json(ord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating order" });
    }
  }

  // Eliminar una orden físicamente
  public async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderToDelete = await Order.findByPk(id);

      if (!orderToDelete) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      await orderToDelete.destroy();
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting order" });
    }
  }

  // Eliminar una orden lógicamente
  public async deleteOrderAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const orderToUpdate = await Order.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (!orderToUpdate) {
        res.status(404).json({ error: "Order not found or already inactive" });
        return;
      }

      await orderToUpdate.update({ status: "INACTIVE", state: "ANULADA" } as any);
      res.status(200).json({ message: "Order marked as inactive" });
    } catch (error) {
      res.status(500).json({ error: "Error marking order as inactive" });
    }
  }

  // Actualizar una orden existente
  public async updateOrder(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const { patientId, doctorId, orderDate, priority, observations, netTotal, state, insuranceId: requestedInsuranceId } = req.body;

      const orderToUpdate = await Order.findOne({ where: { id: pk, status: "ACTIVE" } });
      if (!orderToUpdate) {
        res.status(404).json({ error: "Order not found or inactive" });
        return;
      }

      let finalPatientId = orderToUpdate.patientId;
      if (typeof patientId !== "undefined") {
        const patient = await Patient.findOne({ where: { id: patientId } });
        if (!patient) {
          res.status(404).json({ error: "Patient not found" });
          return;
        }
        finalPatientId = patientId;
      }

      if (priority && !["RUTINA", "URGENTE"].includes(priority)) {
        res.status(400).json({ error: "Invalid priority value" });
        return;
      }

      if (state && !["CREADA", "TOMADA", "EN_PROCESO", "VALIDADA", "ENTREGADA", "ANULADA"].includes(state)) {
        res.status(400).json({ error: "Invalid state value" });
        return;
      }

      let finalInsuranceId = orderToUpdate.insuranceId || null;
      if (typeof requestedInsuranceId !== "undefined") {
        if (requestedInsuranceId === null) {
          finalInsuranceId = null;
        } else {
          const validInsurance = await PatientInsurance.findOne({
            where: { patientId: finalPatientId, insuranceId: requestedInsuranceId, status: "ACTIVE" },
          });
          if (!validInsurance) {
            res.status(400).json({ error: "La aseguradora indicada no pertenece al paciente o no está activa" });
            return;
          }
          finalInsuranceId = requestedInsuranceId;
        }
      } else if (finalPatientId !== orderToUpdate.patientId) {
        if (finalInsuranceId) {
          const stillValid = await PatientInsurance.findOne({
            where: { patientId: finalPatientId, insuranceId: finalInsuranceId, status: "ACTIVE" },
          });
          if (!stillValid) {
            const patIns = await PatientInsurance.findOne({
              where: { patientId: finalPatientId, status: "ACTIVE" },
              order: [["startDate", "DESC"]],
            });
            finalInsuranceId = patIns ? patIns.insuranceId : null;
          }
        } else {
          const patIns = await PatientInsurance.findOne({
            where: { patientId: finalPatientId, status: "ACTIVE" },
            order: [["startDate", "DESC"]],
          });
          finalInsuranceId = patIns ? patIns.insuranceId : null;
        }
      }

      await orderToUpdate.update({
        patientId: finalPatientId,
        doctorId: typeof doctorId !== "undefined" ? doctorId : orderToUpdate.doctorId,
        orderDate: orderDate ?? orderToUpdate.orderDate,
        priority: priority ?? orderToUpdate.priority,
        observations: typeof observations !== "undefined" ? observations : orderToUpdate.observations,
        netTotal: typeof netTotal !== "undefined" ? netTotal : orderToUpdate.netTotal,
        state: state ?? orderToUpdate.state,
        insuranceId: finalInsuranceId,
      } as any);

      res.status(200).json(orderToUpdate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating order" });
    }
  }
}
