import { Router } from 'express';
import authsRouter from './authsRouter';
import deploymentsRouter from './deploymentsRouter';
import testsRouter from './testsRouter';
import usersRouter from './users/usersRouter';
import apiSpecsRouter from './apiSpecsRouter';

const router = Router();

router.use('/users', usersRouter);
router.use('/auths', authsRouter);
router.use('/apiSpecs', apiSpecsRouter);
router.use('/deployments', deploymentsRouter);
router.use('/tests', testsRouter);

export default router;
