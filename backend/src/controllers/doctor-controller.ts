// Controller for Doctor model
import { Request, Response } from "express";
import { Doctor, DoctorI } from "../database/models/Doctor";

export class DoctorController {
  // Obtener todos los doctores con estado "ACTIVE"
  public async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors: DoctorI[] = await Doctor.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ doctors });
    } catch (error) {
      res.status(500).json({ error: "Error fetching doctors" });
    }
  }

  // Obtener un doctor por ID
  public async getDoctorById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const doctor = await Doctor.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (doctor) {
        res.status(200).json(doctor);
      } else {
        res.status(404).json({ error: "Doctor not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching doctor" });
    }
  }

  // Create a new doctor
  public async createDoctor(req: Request, res: Response) {
    const { docType, docNumber, name, specialty, medicalLicense, phone, email, user_id, status } = req.body;
    try {
      let body: DoctorI = {
        docType,
        docNumber,
        name,
        specialty,
        medicalLicense,
        phone,
        email,
        user_id,
        status,
      } as DoctorI;

      const newDoctor = await Doctor.create({ ...body } as any);
      res.status(201).json(newDoctor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a doctor
  public async updateDoctor(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { docType, docNumber, name, specialty, medicalLicense, phone, email, user_id, status } = req.body;
    try {
      let body: DoctorI = {
        docType,
        docNumber,
        name,
        specialty,
        medicalLicense,
        phone,
        email,
        user_id,
        status,
      } as DoctorI;

      const doctorExist = await Doctor.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (doctorExist) {
        await doctorExist.update(body as any, { where: { id: pk } });
        res.status(200).json(doctorExist);
      } else {
        res.status(404).json({ error: "Doctor not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a doctor physically
  public async deleteDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctorToDelete = await Doctor.findByPk(id);

      if (doctorToDelete) {
        await doctorToDelete.destroy();
        res.status(200).json({ message: "Doctor deleted successfully" });
      } else {
        res.status(404).json({ error: "Doctor not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting doctor" });
    }
  }

  // Delete a doctor logically (change status to "INACTIVE")
  public async deleteDoctorAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const doctorToUpdate = await Doctor.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (doctorToUpdate) {
        await doctorToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Doctor marked as inactive" });
      } else {
        res.status(404).json({ error: "Doctor not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking doctor as inactive" });
    }
  }
}
