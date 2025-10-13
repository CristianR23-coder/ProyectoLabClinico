import { Request, Response } from "express";
import { Panel, PanelI } from "../database/models/Panel";

export class PanelController {
  // Obtener todos los paneles con status "ACTIVE"
  public async getAllPanels(req: Request, res: Response) {
    try {
      const panels: PanelI[] = await Panel.findAll({
        where: { status: "ACTIVE" },
      });
      res.status(200).json({ panels });
    } catch (error) {
      res.status(500).json({ error: "Error fetching panels" });
    }
  }

  // Obtener un panel por ID
  public async getPanelById(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const panel = await Panel.findOne({
        where: {
          id: pk,
          status: "ACTIVE",
        },
      });
      if (panel) {
        res.status(200).json(panel);
      } else {
        res.status(404).json({ error: "Panel not found or inactive" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching panel" });
    }
  }

  // Create a new panel
  public async createPanel(req: Request, res: Response) {
    const { name, description, status } = req.body;
    try {
      let body: PanelI = {
        name,
        description,
        status,
      } as PanelI;

      const newPanel = await Panel.create({ ...body } as any);
      res.status(201).json(newPanel);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update a panel
  public async updatePanel(req: Request, res: Response) {
    const { id: pk } = req.params;
    const { name, description, status } = req.body;
    try {
      let body: PanelI = {
        name,
        description,
        status,
      } as PanelI;

      const panelExist = await Panel.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (panelExist) {
        await panelExist.update(body as any, { where: { id: pk } });
        res.status(200).json(panelExist);
      } else {
        res.status(404).json({ error: "Panel not found or inactive" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a panel physically
  public async deletePanel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const panelToDelete = await Panel.findByPk(id);

      if (panelToDelete) {
        await panelToDelete.destroy();
        res.status(200).json({ message: "Panel deleted successfully" });
      } else {
        res.status(404).json({ error: "Panel not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting panel" });
    }
  }

  // Delete a panel logically (change status to "INACTIVE")
  public async deletePanelAdv(req: Request, res: Response) {
    try {
      const { id: pk } = req.params;
      const panelToUpdate = await Panel.findOne({ where: { id: pk, status: "ACTIVE" } });

      if (panelToUpdate) {
        await panelToUpdate.update({ status: "INACTIVE" });
        res.status(200).json({ message: "Panel marked as inactive" });
      } else {
        res.status(404).json({ error: "Panel not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error marking panel as inactive" });
    }
  }
}
