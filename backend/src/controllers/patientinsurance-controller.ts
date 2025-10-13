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

  // Create a new patient insurance
  public async createPatientInsurance(req: Request, res: Response) {
    const { patientId, insuranceId, policyNumber, plan, startDate, endDate, status } = req.body;
    try {
      let body: PatientInsuranceI = {
        patientId,
        insuranceId,
        policyNumber,
        plan,
        startDate,
        endDate: endDate ?? null,
        status,
      } as PatientInsuranceI;

      const newPatientInsurance = await PatientInsurance.create({ ...body } as any);
      res.status(201).json(newPatientInsurance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a patient insurance (composite key)
  public async updatePatientInsurance(req: Request, res: Response) {
    const { patientId, insuranceId } = req.params;
    const { policyNumber, plan, startDate, endDate, status } = req.body;
    try {
      const patientInsuranceExist = await PatientInsurance.findOne({ where: { patientId, insuranceId, status: "ACTIVE" } });

      if (patientInsuranceExist) {
        await patientInsuranceExist.update({ policyNumber, plan, startDate, endDate: endDate ?? null, status } as any);
        res.status(200).json(patientInsuranceExist);
      } else {
        res.status(404).json({ error: "Patient insurance not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a patient insurance physically (composite key)
  public async deletePatientInsurance(req: Request, res: Response) {
    try {
      const { patientId, insuranceId } = req.params;
      const patientInsurance = await PatientInsurance.findOne({ where: { patientId, insuranceId } });

      if (patientInsurance) {
        await patientInsurance.destroy();
        res.status(200).json({ message: "Patient insurance deleted successfully" });
      } else {
        res.status(404).json({ error: "Patient insurance not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting patient insurance" });
    }
  }

  // Delete a patient insurance logically (change status to "INACTIVE")
  public async deletePatientInsuranceAdv(req: Request, res: Response) {
    try {
      const { patientId, insuranceId } = req.params;
      const patientInsurance = await PatientInsurance.findOne({ where: { patientId, insuranceId, status: "ACTIVE" } });

      if (patientInsurance) {
        await patientInsurance.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Patient insurance marked as inactive" });
      } else {
        res.status(404).json({ error: "Patient insurance not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking patient insurance as inactive" });
    }
  }
}
