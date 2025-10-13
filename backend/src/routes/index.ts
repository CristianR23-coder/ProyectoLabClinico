import { Router } from "express";
import { UserRoutes } from "./user";
import { DoctorRoutes } from "./doctor";
import { ExamRoutes } from "./exam";
import { InsuranceRoutes } from "./insurance";
import { OrderItemRoutes } from "./orderitem";
import { PatientRoutes } from "./patient";
import { SampleRoutes } from "./sample";
import { ResultRoutes } from "./result";
import { ParameterRoutes } from "./parameter";
import { PanelRoutes } from "./panel";
import { PatientInsuranceRoutes } from "./patientinsurance";
import { OrderRoutes } from "./order";
import { PanelItemRoutes } from "./panelitem";
import { RoleRoutes } from "./auth/role";
import { ResourceRoutes } from "./auth/resource";
import { ResourceRoleRoutes } from "./auth/resourceRole";
import { RoleUserRoutes } from "./auth/roleUser";
import { RefreshTokenRoutes } from "./auth/refreshToken";
import { AuthUserRoutes } from "./auth/users";
import { AuthRoutes } from "./auth/auth";

export class Routes {
   public userRoutes: UserRoutes = new UserRoutes();
   public doctorRoutes: DoctorRoutes = new DoctorRoutes();
   public examRoutes: ExamRoutes = new ExamRoutes();
   public insuranceRoutes: InsuranceRoutes = new InsuranceRoutes();
   public orderItemRoutes: OrderItemRoutes = new OrderItemRoutes();
   public patientRoutes: PatientRoutes = new PatientRoutes();
   public sampleRoutes: SampleRoutes = new SampleRoutes();
   public resultRoutes: ResultRoutes = new ResultRoutes();
   public parameterRoutes: ParameterRoutes = new ParameterRoutes();
   public panelRoutes: PanelRoutes = new PanelRoutes();
   public patientInsuranceRoutes: PatientInsuranceRoutes = new PatientInsuranceRoutes();
   public orderRoutes: OrderRoutes = new OrderRoutes();
   public panelItemRoutes: PanelItemRoutes = new PanelItemRoutes();
   public roleRoutes: RoleRoutes = new RoleRoutes();
   public resourceRoutes: ResourceRoutes = new ResourceRoutes();
   public resourceRoleRoutes: ResourceRoleRoutes = new ResourceRoleRoutes();
   public roleUserRoutes: RoleUserRoutes = new RoleUserRoutes();
   public refreshTokenRoutes: RefreshTokenRoutes = new RefreshTokenRoutes();
   public authUserRoutes: AuthUserRoutes = new AuthUserRoutes();
   public authRoutes: AuthRoutes = new AuthRoutes();
}

