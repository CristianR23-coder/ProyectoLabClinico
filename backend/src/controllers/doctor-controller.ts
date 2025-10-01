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
}
