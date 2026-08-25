import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(usersRouter);

export default router;
