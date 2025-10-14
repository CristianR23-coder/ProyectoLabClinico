import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { RefreshTokenController } from "../../controllers/auth/refreshToken-controller";

export class RefreshTokenRoutes {
  public refreshTokenController: RefreshTokenController = new RefreshTokenController();

  public routes(app: Router): void {
    app.route("/api/refresh-tokens/public").get(this.refreshTokenController.getAllRefreshToken.bind(this.refreshTokenController));

    app.route("/api/refresh-tokens").get(authMiddleware, this.refreshTokenController.getAllRefreshToken.bind(this.refreshTokenController));
  }
}
