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

  // Create a new patient
  public async createPatient(req: Request, res: Response) {
    const { firstName, lastName, docType, docNumber, birthDate, gender, phone, email, address, status } = req.body;
    try {
      let body: PatientI = {
        firstName,
        lastName,
        docType,
        docNumber,
        birthDate,
        gender,
        phone,
        email,
        address,
        status,
      } as PatientI;

      const newPatient = await Patient.create({ ...body } as any);
      res.status(201).json(newPatient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a patient
  public async updatePatient(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { firstName, lastName, docType, docNumber, birthDate, gender, phone, email, address, status } = req.body;
    try {
      let body: PatientI = {
        firstName,
        lastName,
        docType,
        docNumber,
        birthDate,
        gender,
        phone,
        email,
        address,
        status,
      } as PatientI;

      const patientExist = await Patient.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (patientExist) {
        await patientExist.update(body as any, { where: { id: pk } });
        res.status(200).json(patientExist);
      } else {
        res.status(404).json({ error: "Patient not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a patient physically
  public async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patientToDelete = await Patient.findByPk(id);

      if (patientToDelete) {
        await patientToDelete.destroy();
        res.status(200).json({ message: "Patient deleted successfully" });
      } else {
        res.status(404).json({ error: "Patient not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting patient" });
    }
  }

  // Delete a patient logically (change status to "INACTIVE")
  public async deletePatientAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const patientToUpdate = await Patient.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (patientToUpdate) {
        await patientToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Patient marked as inactive" });
      } else {
        res.status(404).json({ error: "Patient not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking patient as inactive" });
    }
  }
}
