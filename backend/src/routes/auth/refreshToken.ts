import { Router } from "express";
import { RefreshTokenController } from "../../controllers/auth/refreshToken-controller";

export class RefreshTokenRoutes {
  public refreshTokenController: RefreshTokenController = new RefreshTokenController();

  public routes(app: Router): void {
    app.route("/api/refresh-tokens").get(this.refreshTokenController.getAllRefreshToken.bind(this.refreshTokenController));
  }
}
