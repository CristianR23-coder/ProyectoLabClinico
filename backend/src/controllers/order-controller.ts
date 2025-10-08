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
}
