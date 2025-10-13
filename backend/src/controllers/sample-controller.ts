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

  // Create a new sample
  public async createSample(req: Request, res: Response) {
    const { orderId, type, barcode, drawDate, state, observations, status } = req.body;
    try {
      let body: SampleI = {
        orderId,
        type,
        barcode: barcode ?? null,
        drawDate: drawDate ? new Date(drawDate) : null,
        state,
        observations: observations ?? null,
        status,
      } as SampleI;

      const newSample = await Sample.create({ ...body } as any);
      res.status(201).json(newSample);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a sample
  public async updateSample(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { orderId, type, barcode, drawDate, state, observations, status } = req.body;
    try {
      let body: SampleI = {
        orderId,
        type,
        barcode: barcode ?? null,
        drawDate: drawDate ? new Date(drawDate) : null,
        state,
        observations: observations ?? null,
        status,
      } as SampleI;

      const sampleExist = await Sample.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (sampleExist) {
        await sampleExist.update(body as any, { where: { id: pk } });
        res.status(200).json(sampleExist);
      } else {
        res.status(404).json({ error: "Sample not found or annulled" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a sample physically
  public async deleteSample(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sampleToDelete = await Sample.findByPk(id);

      if (sampleToDelete) {
        await sampleToDelete.destroy();
        res.status(200).json({ message: "Sample deleted successfully" });
      } else {
        res.status(404).json({ error: "Sample not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting sample" });
    }
  }

  // Delete a sample logically (change status to "INACTIVE")
  public async deleteSampleAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const sampleToUpdate = await Sample.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (sampleToUpdate) {
        await sampleToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Sample marked as inactive" });
      } else {
        res.status(404).json({ error: "Sample not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking sample as inactive" });
    }
  }
}
