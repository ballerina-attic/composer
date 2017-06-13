 /**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import log from 'log';
import AbstractSourceGenVisitor from './abstract-source-gen-visitor';
import ServiceDefinitionVisitor from './service-definition-visitor';
import AnnotationDefinitionVisitor from './annotation-definition-visitor';
import FunctionDefinitionVisitor from './function-definition-visitor';
import PackageDefinitionVisitor from './package-definition-visitor';
import ImportDeclarationVisitor from './import-declaration-visitor';
import ConnectorDefinitionVisitor from './connector-definition-visitor';
import StructDefinitionVisitor from './struct-definition-visitor';
import ConstantDefinitionVisitor from './constant-definition-visitor';

class BallerinaASTRootVisitor extends AbstractSourceGenVisitor {
  constructor() {
    super();
  }

  canVisitBallerinaASTRoot(astRoot) {
    return true;
  }

  beginVisitBallerinaASTRoot(astRoot) {
    this.appendSource(astRoot.getWSRegion(0));
  }

  visitServiceDefinition(serviceDefinition) {
    const serviceDefinitionVisitor = new ServiceDefinitionVisitor(this);
    serviceDefinition.accept(serviceDefinitionVisitor);
  }

  visitAnnotationDefinition(annotationDefinition) {
    const annotationDefinitionVisitor = new AnnotationDefinitionVisitor(this);
    annotationDefinition.accept(annotationDefinitionVisitor);
  }

  visitConnectorDefinition(connectorDefinition) {
    const connectorDefinitionVisitor = new ConnectorDefinitionVisitor(this);
    connectorDefinition.accept(connectorDefinitionVisitor);
  }

  visitFunctionDefinition(functionDefinition) {
    const functionDefinitionVisitor = new FunctionDefinitionVisitor(this);
    functionDefinition.accept(functionDefinitionVisitor);
  }

  visitStructDefinition(structDefinition) {
    const structDefinitionVisitor = new StructDefinitionVisitor(this);
    structDefinition.accept(structDefinitionVisitor);
  }

  visitPackageDefinition(packageDefinition) {
    const packageDefinitionVisitor = new PackageDefinitionVisitor(this);
    packageDefinition.accept(packageDefinitionVisitor);
  }

  visitImportDeclaration(importDeclaration) {
    const importDeclarationVisitor = new ImportDeclarationVisitor(this);
    importDeclaration.accept(importDeclarationVisitor);
  }

  visitConstantDefinition(constantDefinition) {
    const constantDefinitionVisitor = new ConstantDefinitionVisitor(this);
    constantDefinition.accept(constantDefinitionVisitor);
  }
}

export default BallerinaASTRootVisitor;
