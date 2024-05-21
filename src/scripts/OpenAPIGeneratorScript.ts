export function OpenAPIGeneratorScript(yamlFilePath: string, framework: string, generatorFolder: string) {
  return `npx @openapitools/openapi-generator-cli generate -i ${yamlFilePath} -g ${framework} -o ${generatorFolder}`;
}
