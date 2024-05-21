import { Router } from 'express';
import authsRouter from './authsRouter';
import deploymentsRouter from './deploymentsRouter';
import testsRouter from './testsRouter';
import projectsRouter from './projectsRouter';
import deployInfosRouter from './deployInfosRouter';
import codeGensRouter from './codeGensRouter';

const router = Router();

router.use('/deployInfos', deployInfosRouter);
router.use('/auths', authsRouter);
router.use('/projects', projectsRouter);
router.use('/codeGens', codeGensRouter);
router.use('/deployments', deploymentsRouter);
router.use('/tests', testsRouter);

export default router;
