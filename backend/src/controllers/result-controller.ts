import { Request, Response } from "express";
import { Result, ResultI } from "../database/models/Result";

export class ResultController {
  // Obtener todos los resultados con estado distinto de "RECHAZADO"
  public async getAllResults(req: Request, res: Response) {
    try {
      const results: ResultI[] = await Result.findAll({
        where: {
          status: "ACTIVE",
          resultState: ["PENDIENTE", "VALIDADO"],
        },
      });
      res.status(200).json({ results });
    } catch (error) {
      res.status(500).json({ error: "Error fetching results" });
    }
  }

  // Obtener un resultado por ID
  public async getResultById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const result = await Result.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
          resultState: ["PENDIENTE", "VALIDADO"]
        },
      });
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: "Result not found or rejected" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching result" });
    }
  }

  // Create a new result
  public async createResult(req: Request, res: Response) {
    const {
      orderId,
      sampleId,
      examId,
      parameterId,
      numValue,
      textValue,
      outRange,
      dateResult,
      validatedForId,
      validatedFor,
      method,
      units,
      comment,
      resultState,
      status,
    } = req.body;
    try {
      let body: ResultI = {
        orderId,
        sampleId,
        examId,
        parameterId,
        numValue: numValue !== undefined && numValue !== null ? parseFloat(numValue) : null,
        textValue: textValue ?? null,
        outRange: outRange !== undefined ? Boolean(outRange) : null,
        dateResult: dateResult ? new Date(dateResult) : null,
        validatedForId: validatedForId ?? null,
        validatedFor: validatedFor ?? null,
        method: method ?? null,
        units: units ?? null,
        comment: comment ?? null,
        resultState,
        status,
      } as ResultI;

      const newResult = await Result.create({ ...body } as any);
      res.status(201).json(newResult);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a result
  public async updateResult(req: Request, res: Response) {
    const { id: pk } = req.params;
    const {
      orderId,
      sampleId,
      examId,
      parameterId,
      numValue,
      textValue,
      outRange,
      dateResult,
      validatedForId,
      validatedFor,
      method,
      units,
      comment,
      resultState,
      status,
    } = req.body;
    try {
      let body: ResultI = {
        orderId,
        sampleId,
        examId,
        parameterId,
        numValue: numValue !== undefined && numValue !== null ? parseFloat(numValue) : null,
        textValue: textValue ?? null,
        outRange: outRange !== undefined ? Boolean(outRange) : null,
        dateResult: dateResult ? new Date(dateResult) : null,
        validatedForId: validatedForId ?? null,
        validatedFor: validatedFor ?? null,
        method: method ?? null,
        units: units ?? null,
        comment: comment ?? null,
        resultState,
        status,
      } as ResultI;

      const resultExist = await Result.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (resultExist) {
        await resultExist.update(body as any, { where: { id: pk } });
        res.status(200).json(resultExist);
      } else {
        res.status(404).json({ error: "Result not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a result physically
  public async deleteResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resultToDelete = await Result.findByPk(id);

      if (resultToDelete) {
        await resultToDelete.destroy();
        res.status(200).json({ message: "Result deleted successfully" });
      } else {
        res.status(404).json({ error: "Result not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting result" });
    }
  }

  // Delete a result logically (change status to "INACTIVE")
  public async deleteResultAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const resultToUpdate = await Result.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (resultToUpdate) {
        await resultToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Result marked as inactive" });
      } else {
        res.status(404).json({ error: "Result not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking result as inactive" });
    }
  }
}
