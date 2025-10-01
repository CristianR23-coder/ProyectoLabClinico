import { Request, Response } from "express";
import { PatientInsurance, PatientInsuranceI } from "../database/models/PatientInsurance";

export class PatientInsuranceController {
  // Obtener todos los seguros de pacientes con estado "ACTIVE"
  public async getAllPatientInsurances(req: Request, res: Response) {
    try {
      const patientInsurances: PatientInsuranceI[] = await PatientInsurance.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ patientInsurances });
    } catch (error) {
      res.status(500).json({ error: "Error fetching patient insurances" });
    }
  }

  // Obtener un seguro de paciente por IDs compuestos
  public async getPatientInsuranceById(req: Request, res: Response) {
    try {
      const { patientId, insuranceId } = req.params;
      const patientInsurance = await PatientInsurance.findOne({
        where: {
          patientId,
          insuranceId,
          status: "ACTIVE",
        },
      });
      if (patientInsurance) {
        res.status(200).json(patientInsurance);
      } else {
        res.status(404).json({ error: "Patient insurance not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching patient insurance" });
    }
  }
}
