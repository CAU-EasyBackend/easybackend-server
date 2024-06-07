import SwaggerParser from '@apidevtools/swagger-parser';
import fs from "fs";
import yaml from "js-yaml";

SwaggerParser.validate('test/project-test1.yaml')
  .then(api => {
    console.log('API is valid');
  })
  .catch(err => {
    console.error('API is invalid');
    console.error(err);
  });

/*
SwaggerParser.parse('test/openapi.yaml')
  .then(api => {
    console.log('success');
    //console.log(api);

    const paths = api.paths;
    for(const path in paths) {
      const pathItem = paths[path];
      //console.log(pathItem);
      for(const method in pathItem) {
        console.log(method);
        const operation: any = pathItem.put;
        if(operation == undefined) {
          break;
        }
        console.log(operation);

        const requestBody: any = operation["requestBody"];
        console.log(requestBody);

        const content: any = requestBody["content"];
        console.log(content);

        const new_content = {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string"
                },
                "age": {
                  "type": "number"
                }
              }
            }
          }
        };

        requestBody["content"] = new_content;
        console.log(requestBody);
        console.log(requestBody["content"]);
        console.log(requestBody["content"]["application/json"]);
        console.log(requestBody["content"]["application/json"]["schema"]);
        break;
      }
      break;
    }

    const yaml_str = yaml.dump(api);
    fs.writeFileSync('test/openapi2.yaml', yaml_str, 'utf8');
  })
  .catch(err => {
    console.log('error');
    console.error(err);
  });
*/
