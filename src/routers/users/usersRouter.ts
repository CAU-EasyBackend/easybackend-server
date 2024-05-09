import {Request, Response, Router} from 'express';
import deployInfosRouter from './deployInfosRouter';

const router = Router();

router.use('/:userId/deployInfos', deployInfosRouter);

export default router;
