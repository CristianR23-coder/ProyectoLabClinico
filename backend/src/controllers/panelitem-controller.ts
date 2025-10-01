import { Request, Response } from "express";
import { PanelItem, PanelItemI } from "../database/models/PanelItem";

export class PanelItemController {
  // Obtener todos los items de panel
  public async getAllPanelItems(req: Request, res: Response) {
    try {
      const panelItems: PanelItemI[] = await PanelItem.findAll();
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
        where: { id: pk },
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
}
