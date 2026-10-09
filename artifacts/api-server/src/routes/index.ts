import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import leadServicesRouter from "./lead-services";
import servicesRouter from "./services";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(leadServicesRouter);
router.use(servicesRouter);
router.use(usersRouter);

export default router;
