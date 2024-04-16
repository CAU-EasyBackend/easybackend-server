import { Router } from 'express';
import authRouter from './authRouter';
import testRouter from './testRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/test', testRouter);

export default router;
