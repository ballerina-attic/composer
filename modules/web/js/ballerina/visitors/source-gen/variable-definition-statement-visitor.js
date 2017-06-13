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
import AbstractStatementSourceGenVisitor from './abstract-statement-source-gen-visitor';
import VariableDefinitionStatement from '../../ast/statements/variable-definition-statement';

class VariableDefinitionStatementVisitor extends AbstractStatementSourceGenVisitor {
  constructor(parent) {
    super(parent);
  }

  canVisitVariableDefinitionStatement(variableDefinitionStatement) {
    return variableDefinitionStatement instanceof VariableDefinitionStatement;
  }

  beginVisitVariableDefinitionStatement(variableDefinitionStatement) {
    if (variableDefinitionStatement.whiteSpace.useDefault) {
      this.currentPrecedingIndentation = this.getCurrentPrecedingIndentation();
      this.replaceCurrentPrecedingIndentation(this.getIndentation());
    }
    const constructedSource = variableDefinitionStatement.getStatementString();
    this.appendSource(constructedSource);
  }

  endVisitVariableDefinitionStatement(variableDefinitionStatement) {
    this.appendSource(`;${variableDefinitionStatement.getWSRegion(4)}`);
    this.appendSource((variableDefinitionStatement.whiteSpace.useDefault)
            ? this.currentPrecedingIndentation : '');
    this.getParent().appendSource(this.getGeneratedSource());
  }
}

export default VariableDefinitionStatementVisitor;
