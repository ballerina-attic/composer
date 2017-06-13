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
import Statement from './statement';

/**
 * Class for Timeout clause in ballerina.
 * Must always be added to ForkJoinStatement as a child
 * @param args none.
 * @constructor
 */
class TimeoutStatement extends Statement {
  constructor(args) {
    super('TimeoutStatement');
    const parameterDefinition = this.getFactory().createParameterDefinition({ typeName: 'map', name: 'm' });
    this._timeoutParameter = _.get(args, 'timeoutParameter', parameterDefinition);
    this._expression = _.get(args, 'expression', '60');
  }

  getWorkerDeclarations() {
    const workerDeclarations = [];
    const self = this;

    _.forEach(this.getChildren(), (child) => {
      if (self.getFactory().isWorkerDeclaration(child)) {
        workerDeclarations.push(child);
      }
    });
    return _.sortBy(workerDeclarations, [function (workerDeclaration) {
      return workerDeclaration.getWorkerName();
    }]);
  }

  getParameterAsString() {
    return this.getParameter().getParameterDefinitionAsString();
  }

  setExpression(expression, options) {
    if (!_.isNil(expression)) {
      this.setAttribute('_expression', expression, options);
    }
  }

  setParameterAsString(str) {
    const myRegexp = /^\s*(map\s*)([^\s\[\]]+)\s*$/g;
    const match = myRegexp.exec(str);
    if (match) {
      const factory = this.getFactory();
      const typeName = match[1];
      const name = match[2];
      const parameterDefinition = factory.createParameterDefinition({ typeName, name });
      this.setParameter(parameterDefinition);
    }
  }

  getExpression() {
    return this._expression;
  }

  setParameter(type, options) {
    if (!_.isNil(type)) {
      this.setAttribute('_timeoutParameter', type, options);
    }
  }

  getParameter() {
    return this._timeoutParameter;
  }

  initFromJson(jsonNode) {
    const self = this;
    const expressionChildNode = jsonNode.expression;
    const expressionChild = self.getFactory().createFromJson(expressionChildNode);
    expressionChild.initFromJson(expressionChildNode);
    self.setExpression(expressionChild.getExpressionString());

    const paramJsonNode = jsonNode.timeout_parameter;
    const paramChild = self.getFactory().createFromJson(paramJsonNode);
    paramChild.initFromJson(paramJsonNode);
    self.setParameter(paramChild);

    _.each(jsonNode.children, (childNode) => {
      const child = self.getFactory().createFromJson(childNode);
      self.addChild(child);
      child.initFromJson(childNode);
    });
  }
}

export default TimeoutStatement;
