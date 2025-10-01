import { Request, Response } from "express";
import { Insurance, InsuranceI } from "../database/models/Insurance";

export class InsuranceController {
  // Obtener todas las aseguradoras con estado "ACTIVE"
  public async getAllInsurances(req: Request, res: Response) {
    try {
      const insurances: InsuranceI[] = await Insurance.findAll({
        where: { status: "ACTIVE" },
      });
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
}
