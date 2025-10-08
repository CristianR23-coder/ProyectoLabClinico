import { Request, Response } from "express";
import { Sample, SampleI } from "../database/models/Sample";

export class SampleController {
  // Obtener todas las muestras con estado distinto de "ANULADA"
  public async getAllSamples(req: Request, res: Response) {
    try {
      const samples: SampleI[] = await Sample.findAll({
        where: {
          status: "ACTIVE",
          state: [
            "RECOLECTADA",
            "ALMACENADA",
            "ENVIADA",
            "EN_PROCESO",
            "EVALUADA",
            "RECHAZADA"
          ]
        },
      });
      res.status(200).json({ samples });
    } catch (error) {
      res.status(500).json({ error: "Error fetching samples" });
    }
  }

  // Obtener una muestra por ID
  public async getSampleById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const sample = await Sample.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
          state: [
            "RECOLECTADA",
            "ALMACENADA",
            "ENVIADA",
            "EN_PROCESO",
            "EVALUADA",
            "RECHAZADA"
          ]
        },
      });
      if (sample) {
        res.status(200).json(sample);
      } else {
        res.status(404).json({ error: "Sample not found or annulled" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching sample" });
    }
  }
}
