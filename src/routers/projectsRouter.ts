import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/passport-github';
import wrapAsync from '../helpers/wrapFunction';
import ProjectsService from '../services/projectsService';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import upload from '../middlewares/multerMiddleware';
import fs from 'fs';
import { OpenAPI } from "openapi-types";

const router = Router();

/**
 * 프로젝트 목록 조회 api
 * get: /api/projects/list
 */
router.get('/list', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projects = await ProjectsService.getProjectList(userId);

  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus, projects));
}));

/**
 * api 명세 객체 조회 api
 * get: /api/projects/:projectId/apiSpec
 */
router.get('/:projectId/apiSpec', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.params.projectId;

  const responseStatus = BaseResponseStatus.SUCCESS;
  const apiSpec = await ProjectsService.getApiSpec(userId, projectId);

  return res.status(responseStatus.status).json(response(responseStatus, {apiSpec: apiSpec.apiObject}));
}));

/**
 * api 명세 yaml 파일 조회 api
 * get: /api/projects/:projectId/apiSpec/yaml
 */
router.get('/:projectId/apiSpec/yaml', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.params.projectId;

  const apiSpec = await ProjectsService.getApiSpec(userId, projectId);

  res.setHeader('Content-Type', 'test/yaml');
  res.setHeader('Content-Disposition', `attachment; filename=${apiSpec.projectName}.yaml`);
  res.send(apiSpec.yamlContent);
}));

/**
 * api 명세서 저장 api
 * put: /api/projects/apiSpec/save
 * body: projectName
 */
router.put('/apiSpec/save', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectName = req.body.projectName;
  const apiObject: string = req.body.api;

  console.log("sdf",projectName)

  const responseStatus = BaseResponseStatus.SUCCESS;
  await ProjectsService.saveApiSpec(userId, projectName, apiObject);

  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 * api 명세서 yaml 파일로 저장 api
 * put: /api/projects/apiSpec/save/yaml
 * body: projectName
 */
router.put('/apiSpec/save/yaml', isAuthenticated, upload.single('yamlFile'), wrapAsync(async (req: Request, res: Response) => {
  
  if(!req.file) {
    const responseStatus = BaseResponseStatus.YAML_UPLOAD_ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }

  const userId = req.user!.userId;
  const projectName = req.body.projectName;
  

  const yamlFilePath = req.file.path;
  const yamlContent = fs.readFileSync(yamlFilePath, 'utf-8');

  const responseStatus = BaseResponseStatus.SUCCESS;
  await ProjectsService.saveApiSpecYaml(userId, projectName, yamlContent);

  return res.status(responseStatus.status).json(response(responseStatus));
}));

export default router;
