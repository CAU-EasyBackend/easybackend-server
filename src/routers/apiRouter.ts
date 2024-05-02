import { Router } from 'express';
import deploymentRouter from './deploymentRouter';
import testRouter from './testRouter';

const router = Router();

router.use('/deployment', deploymentRouter);
router.use('/test', testRouter);

export default router;
