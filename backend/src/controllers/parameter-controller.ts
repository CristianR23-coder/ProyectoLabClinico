import { Request, Response } from "express";
import { Parameter, ParameterI } from "../database/models/Parameter";

export class ParameterController {
  // Obtener todos los parámetros
  public async getAllParameters(req: Request, res: Response) {
    try {
      const parameters: ParameterI[] = await Parameter.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ parameters });
    } catch (error) {
      res.status(500).json({ error: "Error fetching parameters" });
    }
  }

  // Obtener un parámetro por ID
  public async getParameterById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const parameter = await Parameter.findOne({
        where: { id: pk, status: "ACTIVE" },
      });
      if (parameter) {
        res.status(200).json(parameter);
      } else {
        res.status(404).json({ error: "Parameter not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching parameter" });
    }
  }

  // Create a new parameter
  public async createParameter(req: Request, res: Response) {
    const { examenId, code, name, unit, refMin, refMax, typeValue, decimals, visualOrder, status } = req.body;
    try {
      let body: ParameterI = {
        examenId,
        code: code ?? null,
        name,
        unit: unit ?? null,
        refMin: refMin ?? null,
        refMax: refMax ?? null,
        typeValue,
        decimals: decimals ?? null,
        visualOrder: visualOrder ?? null,
        status,
      } as ParameterI;

      const newParameter = await Parameter.create({ ...body } as any);
      res.status(201).json(newParameter);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a parameter
  public async updateParameter(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { examenId, code, name, unit, refMin, refMax, typeValue, decimals, visualOrder, status } = req.body;
    try {
      let body: ParameterI = {
        examenId,
        code: code ?? null,
        name,
        unit: unit ?? null,
        refMin: refMin ?? null,
        refMax: refMax ?? null,
        typeValue,
        decimals: decimals ?? null,
        visualOrder: visualOrder ?? null,
        status,
      } as ParameterI;

      const parameterExist = await Parameter.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (parameterExist) {
        await parameterExist.update(body as any, { where: { id: pk } });
        res.status(200).json(parameterExist);
      } else {
        res.status(404).json({ error: "Parameter not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a parameter physically
  public async deleteParameter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parameterToDelete = await Parameter.findByPk(id);

      if (parameterToDelete) {
        await parameterToDelete.destroy();
        res.status(200).json({ message: "Parameter deleted successfully" });
      } else {
        res.status(404).json({ error: "Parameter not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting parameter" });
    }
  }

  // Delete a parameter logically (change status to "INACTIVE")
  public async deleteParameterAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const parameterToUpdate = await Parameter.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (parameterToUpdate) {
        await parameterToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Parameter marked as inactive" });
      } else {
        res.status(404).json({ error: "Parameter not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking parameter as inactive" });
    }
  }
}
