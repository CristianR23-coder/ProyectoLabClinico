import { Request, Response } from "express";
import { PanelItem, PanelItemI } from "../database/models/PanelItem";

export class PanelItemController {
  // Obtener todos los items de panel
  public async getAllPanelItems(req: Request, res: Response) {
    try {
      const panelItems: PanelItemI[] = await PanelItem.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ panelItems });
    } catch (error) {
      res.status(500).json({ error: "Error fetching panel items" });
    }
  }

  // Obtener un item de panel por ID
  public async getPanelItemById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const panelItem = await PanelItem.findOne({
        where: { id: pk, status: "ACTIVE" },
      });
      if (panelItem) {
        res.status(200).json(panelItem);
      } else {
        res.status(404).json({ error: "Panel item not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching panel item" });
    }
  }

  // Create a new panel item
  public async createPanelItem(req: Request, res: Response) {
    const { panelId, kind, examId, parameterId, required, order, notes, status } = req.body;
    try {
      let body: PanelItemI = {
        panelId,
        kind,
        examId: examId ?? null,
        parameterId: parameterId ?? null,
        required: required ?? false,
        order: order ?? null,
        notes: notes ?? null,
        status,
      } as PanelItemI;

      const newPanelItem = await PanelItem.create({ ...body } as any);
      res.status(201).json(newPanelItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a panel item
  public async updatePanelItem(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { panelId, kind, examId, parameterId, required, order, notes, status } = req.body;
    try {
      let body: PanelItemI = {
        panelId,
        kind,
        examId: examId ?? null,
        parameterId: parameterId ?? null,
        required: required ?? false,
        order: order ?? null,
        notes: notes ?? null,
        status,
      } as PanelItemI;

      const panelItemExist = await PanelItem.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (panelItemExist) {
        await panelItemExist.update(body as any, { where: { id: pk } });
        res.status(200).json(panelItemExist);
      } else {
        res.status(404).json({ error: "Panel item not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a panel item physically
  public async deletePanelItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const panelItemToDelete = await PanelItem.findByPk(id);

      if (panelItemToDelete) {
        await panelItemToDelete.destroy();
        res.status(200).json({ message: "Panel item deleted successfully" });
      } else {
        res.status(404).json({ error: "Panel item not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting panel item" });
    }
  }

  // Delete a panel item logically (change status to "INACTIVE")
  public async deletePanelItemAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const panelItemToUpdate = await PanelItem.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (panelItemToUpdate) {
        await panelItemToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Panel item marked as inactive" });
      } else {
        res.status(404).json({ error: "Panel item not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking panel item as inactive" });
    }
  }
}
