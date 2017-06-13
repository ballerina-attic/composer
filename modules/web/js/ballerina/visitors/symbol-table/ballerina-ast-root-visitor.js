/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import _ from 'lodash';
import AbstractSymbolTableGenVisitor from './abstract-symbol-table-gen-visitor';
import BallerinaEnvFactory from './../../env/ballerina-env-factory';
import BallerinaASTFactory from './../../ast/ballerina-ast-factory';

class BallerinaASTRootVisitor extends AbstractSymbolTableGenVisitor {
  constructor(pckg, model) {
    super(pckg);
    this._model = model;
    this.init();
  }

    /**
     * init function
     */
  init() {
        // Registering event listeners
    this._model.on('child-added', function (child) {
      this.visit(child);
    }, this);
    this._model.on('child-removed', function (child) {
      if (BallerinaASTFactory.isFunctionDefinition(child)) {
        this.removeFunctionDefinition(child);
      } else if (BallerinaASTFactory.isConnectorDefinition(child)) {
        this.removeConnectorDefinition(child);
      }
    }, this);
  }

  canVisitBallerinaASTRoot(serviceDefinition) {
    return true;
  }

  beginVisitBallerinaASTRoot(serviceDefinition) {
  }

  visitBallerinaASTRoot(ballerinaASTRoot) {
  }

  endVisitBallerinaASTRoot(serviceDefinition) {
  }

    /**
     * visit function definition
     * @param {Object} functionDefinition - function definition model
     */
  visitFunctionDefinition(functionDefinition) {
    const functionDef = BallerinaEnvFactory.createFunction();
    functionDef.setName(functionDefinition.getFunctionName());
    functionDef.setId(functionDefinition.getFunctionName());

        // Adding arguments
    const args = [];
    _.forEach(functionDefinition.getArguments(), (argument) => {
      args.push({
        name: argument.getName(),
        type: argument.getTypeName(),
      });
    });
    functionDef.setParameters(args);

        // Adding return types
    const returnTypes = [];
    _.forEach(functionDefinition.getReturnTypes(), (returnType) => {
            // Return type contains an Argument child.
      if (_.isNull(returnType.getName())) {
                // some return types only have a type
        returnTypes.push({
          type: returnType.getTypeName(),
        });
      } else {
        returnTypes.push({
          name: returnType.getName(),
          type: returnType.getTypeName(),
        });
      }
    });
    functionDef.setReturnParams(returnTypes);

    this.getPackage().addFunctionDefinitions(functionDef);

    const self = this;
    functionDefinition.on('tree-modified', (modifiedData) => {
      if (_.isNil(modifiedData.data)) {
        return;
      }
      const attributeName = modifiedData.data.attributeName;
      const oldValue = modifiedData.data.oldValue;
      let newValue = modifiedData.data.newValue;
      if (BallerinaASTFactory.isFunctionDefinition(modifiedData.origin)) {
        if (!_.isEqual(attributeName, '_functionName')) {
          newValue = undefined;
        }
        self.updateFunctionDefinition(modifiedData.origin, oldValue, newValue, modifiedData.data.child);
      } else if (BallerinaASTFactory.isReturnType(modifiedData.origin)) {
        self.updateFunctionDefinition(modifiedData.origin.getParent(), oldValue, newValue, modifiedData.origin);
      }
    });
  }

  visitStructDefinition(structDefinition) {
    this.getPackage().addStructDefinitions(structDefinition);
  }

  visitTypeMapperDefinition(typeMapperDefinition) {
        // todo need to refactored
//            var typeMapperDef = BallerinaEnvFactory.createTypeMapper();
//            typeMapperDef.setName(typeMapperDefinition.getTypeMapperName());
//            typeMapperDef.setTitle(typeMapperDefinition.getTypeMapperName());
//            typeMapperDef.setId(typeMapperDefinition.getTypeMapperName());
//            typeMapperDef.setSourceAndIdentifier(typeMapperDefinition.getSourceAndIdentifier());
//            typeMapperDef.setReturnType(typeMapperDefinition.getReturnType());
    this.getPackage().addTypeMapperDefinitions(typeMapperDefinition);
  }

    /**
     * visit connector definition
     * @param {Object} connectorDefinition - connector definition model
     */
  visitConnectorDefinition(connectorDefinition) {
    const connector = BallerinaEnvFactory.createConnector();
    connector.setName(connectorDefinition.getConnectorName());
    connector.setId(connectorDefinition.getConnectorName());
    this.getPackage().addConnectors(connector);

    const self = this;
    connectorDefinition.on('tree-modified', (modifiedData) => {
      const attributeName = modifiedData.data.attributeName;
      const newValue = modifiedData.data.newValue;
      const oldValue = modifiedData.data.oldValue;
      if (BallerinaASTFactory.isConnectorDefinition(modifiedData.origin)) {
        self.updateConnectorDefinition(connector, modifiedData);
      }
    });

        // TODO : move this to the visit method
    _.each(connectorDefinition.getChildren(), (child) => {
      if (BallerinaASTFactory.isConnectorAction(child)) {
        const connectorAction = BallerinaEnvFactory.createConnectorAction();
        connectorAction.initFromASTModel(child);
        connector.addAction(connectorAction);

        child.on('tree-modified', (modifiedData) => {
          const attributeName = modifiedData.data.attributeName;
          const newValue = modifiedData.data.newValue;
          const oldValue = modifiedData.data.oldValue;
          if (BallerinaASTFactory.isConnectorAction(modifiedData.origin) && _.isEqual(attributeName, 'action_name')) {
            self.updateConnectorActionDefinition(child.getParent().getConnectorName(), oldValue, newValue);
          }
        });
      } else if (BallerinaASTFactory.isResourceParameter(child)) {
        connector.addParam(child);
      }
    });
    connectorDefinition.on('child-added', (child) => {
      if (BallerinaASTFactory.isConnectorAction(child)) {
        const connectorAction = BallerinaEnvFactory.createConnectorAction();
        connectorAction.initFromASTModel(child);
        connector.addAction(connectorAction);

        child.on('tree-modified', (modifiedData) => {
          const attributeName = modifiedData.data.attributeName;
          const newValue = modifiedData.data.newValue;
          const oldValue = modifiedData.data.oldValue;
          if (BallerinaASTFactory.isConnectorAction(modifiedData.origin) && _.isEqual(attributeName, 'action_name')) {
            self.updateConnectorActionDefinition(child.getParent().getConnectorName(), oldValue, newValue);
          }
        });
      }
    }, this);

    connectorDefinition.on('child-removed', (child) => {
      if (BallerinaASTFactory.isConnectorAction(child)) {
        self.removeConnectorActionDefinition(connectorDefinition, child);
      }
    }, this);
  }

    /**
     * remove given function definition from the package object
     * @param {Object} functionDef - function definition to be removed
     */
  removeFunctionDefinition(functionDef) {
    this.getPackage().removeFunctionDefinition(functionDef);
  }

    /**
     * remove given connector definition from the package object
     * @param {Object} connectorDef - connector definition to be removed
     */
  removeConnectorDefinition(connectorDef) {
    this.getPackage().removeConnectorDefinition(connectorDef);
  }

    /**
     * remove given connector action definition from the package object
     * @param {Object} connectorDef - connector definition
     * @param connectorActionDef - connector action definition to be removed
     */
  removeConnectorActionDefinition(connectorDef, connectorActionDef) {
    this.getPackage().getConnectorByName(connectorDef.getConnectorName()).removeAction(connectorActionDef);
  }

    /**
     * updates function definition with new value
     * @param {Object} functionDefinition - function name
     * @param {Object} newValue - new value
     * @param {Object} child - child which is getting modified
     */
  updateFunctionDefinition(functionDefinition, oldValue, newValue, child) {
    const funcName = functionDefinition.getFunctionName();
    let functionDef = this.getPackage().getFunctionDefinitionByName(funcName);
    if (newValue) {
      functionDef = this.getPackage().getFunctionDefinitionByName(oldValue);
      functionDef.setName(newValue);
      functionDef.setId(newValue);
    }
    if (child) {
      if (BallerinaASTFactory.isReturnType(child)) {
        const returnTypes = [];
        _.forEach(functionDefinition.getReturnTypes(), (returnType) => {
          returnTypes.push({
            name: returnType.getName(),
            type: returnType.getTypeName(),
          });
        });
        functionDef.setReturnParams(returnTypes);
      } else if (BallerinaASTFactory.isArgument(child)) {
        const args = [];
        _.forEach(functionDefinition.getArguments(), (argument) => {
          args.push({
            name: argument.getName(),
            type: argument.getTypeName(),
          });
        });
        functionDef.setParameters(args);
      }
    }
  }

    /**
     * updates connector definition with new value
     * @param {Object} oldValue - old value
     * @param {Object} newValue - new value
     */
  updateConnectorDefinition(connectorDefinition, modifiedData) {
    if (modifiedData.type === 'child-added') {
            // child_added sends different format of data
      if (BallerinaASTFactory.isArgument(modifiedData.data.child)) {
        connectorDefinition.addParam(modifiedData.data.child);
        return;
      }
    }

    const attributeName = modifiedData.data.attributeName;
    const newValue = modifiedData.data.newValue;
    const oldValue = modifiedData.data.oldValue;
    switch (attributeName) {
      case 'connector_name':
        connectorDefinition.setName(newValue);
        connectorDefinition.setId(newValue);
        break;

    }
  }

    /**
     * updates connector definition with new value
     * @param {Object} connector - connector for the action
     * @param {Object} oldValue - old value
     * @param {Object} newValue - new value
     */
  updateConnectorActionDefinition(connector, oldValue, newValue) {
    const connectorActionDefinition = this.getPackage().getConnectorByName(connector).getActionByName(oldValue);
    connectorActionDefinition.setName(newValue);
    connectorActionDefinition.setId(newValue);
  }
}

export default BallerinaASTRootVisitor;
