import { Router } from 'express';
import authsRouter from './authsRouter';
import deploymentsRouter from './deploymentsRouter';
import testsRouter from './testsRouter';
import apiSpecsRouter from './apiSpecsRouter';
import deployInfosRouter from './deployInfosRouter';

const router = Router();

router.use('/deployInfos', deployInfosRouter);
router.use('/auths', authsRouter);
router.use('/apiSpecs', apiSpecsRouter);
router.use('/deployments', deploymentsRouter);
router.use('/tests', testsRouter);

export default router;
