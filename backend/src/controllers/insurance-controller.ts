import { Request, Response } from "express";
import { Insurance, InsuranceI } from "../database/models/Insurance";

export class InsuranceController {
  // Obtener aseguradoras. Si ?status=ACTIVE/INACTIVE, filtra; en otro caso trae todas.
  public async getAllInsurances(req: Request, res: Response) {
    try {
      const rawStatus = (req.query.status as string | undefined)?.toUpperCase();
      const allowed: InsuranceI['status'][] = ['ACTIVE', 'INACTIVE'];
      const where: Partial<InsuranceI> = {};

      if (rawStatus && allowed.includes(rawStatus as InsuranceI['status'])) {
        where.status = rawStatus as InsuranceI['status'];
      }

      const insurances: InsuranceI[] = await Insurance.findAll({ where });
      res.status(200).json({ insurances });
    } catch (error) {
      res.status(500).json({ error: "Error fetching insurances" });
    }
  }

  // Obtener una aseguradora por ID
  public async getInsuranceById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const insurance = await Insurance.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (insurance) {
        res.status(200).json(insurance);
      } else {
        res.status(404).json({ error: "Insurance not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching insurance" });
    }
  }

  // Create a new insurance
  public async createInsurance(req: Request, res: Response) {
    const { name, nit, phone, email, address, status } = req.body;
    try {
      let body: InsuranceI = {
        name,
        nit,
        phone,
        email,
        address,
        status,
      } as InsuranceI;

      const newInsurance = await Insurance.create({ ...body } as any);
      res.status(201).json(newInsurance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update an insurance
  public async updateInsurance(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { name, nit, phone, email, address, status } = req.body;
    try {
      let body: InsuranceI = {
        name,
        nit,
        phone,
        email,
        address,
        status,
      } as InsuranceI;

      const insuranceExist = await Insurance.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (insuranceExist) {
        await insuranceExist.update(body as any, { where: { id: pk } });
        res.status(200).json(insuranceExist);
      } else {
        res.status(404).json({ error: "Insurance not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete an insurance physically
  public async deleteInsurance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const insuranceToDelete = await Insurance.findByPk(id);

      if (insuranceToDelete) {
        await insuranceToDelete.destroy();
        res.status(200).json({ message: "Insurance deleted successfully" });
      } else {
        res.status(404).json({ error: "Insurance not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting insurance" });
    }
  }

  // Delete an insurance logically (change status to "INACTIVE")
  public async deleteInsuranceAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const insuranceToUpdate = await Insurance.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (insuranceToUpdate) {
        await insuranceToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Insurance marked as inactive" });
      } else {
        res.status(404).json({ error: "Insurance not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking insurance as inactive" });
    }
  }
}
