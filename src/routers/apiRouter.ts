import { Router } from 'express';
import authRouter from './authRouter';
import deploymentRouter from './deploymentRouter';
import testRouter from './testRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/deployment', deploymentRouter);
router.use('/test', testRouter);

export default router;
