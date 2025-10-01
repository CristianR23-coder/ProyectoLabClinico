import { Request, Response } from "express";
import { Patient, PatientI } from "../database/models/Patient";

export class PatientController {
  // Obtener todos los pacientes con estado "ACTIVE"
  public async getAllPatients(req: Request, res: Response) {
    try {
      const patients: PatientI[] = await Patient.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ patients });
    } catch (error) {
      res.status(500).json({ error: "Error fetching patients" });
    }
  }

  // Obtener un paciente por ID
  public async getPatientById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const patient = await Patient.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (patient) {
        res.status(200).json(patient);
      } else {
        res.status(404).json({ error: "Patient not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching patient" });
    }
  }
}
