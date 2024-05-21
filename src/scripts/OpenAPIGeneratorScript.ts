import * as yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

const generatorFolder = path.resolve(__dirname, '..', '..', 'temps', 'generate');
if(!fs.existsSync(generatorFolder)) {
  fs.mkdirSync(generatorFolder, { recursive: true });
}

export function OpenAPIGeneratorScript(projectName: string, frameworkType: string, yamlContent: string) {
  let framework = 'nodejs-express-server';
  if(frameworkType === 'express') {
    framework = 'nodejs-express-server';
  } else if(frameworkType === 'spring') {
    framework = 'spring';
  }

  const yamlFilePath = path.resolve(generatorFolder, `${projectName}.yaml`);
  fs.writeFileSync(yamlFilePath, yamlContent, 'utf-8');

  return `npx @openapitools/openapi-generator-cli generate -i ${yamlFilePath} -g ${framework} -o ${generatorFolder}/${projectName}`;
}
