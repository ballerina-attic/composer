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
import BreakStatement from '../../ast/statements/break-statement';

class BreakStatementVisitor extends AbstractStatementSourceGenVisitor {
  constructor(parent) {
    super(parent);
  }

  canVisitBreakStatement(breakStatement) {
    return breakStatement instanceof BreakStatement;
  }

  beginVisitBreakStatement(breakStatement) {
    this.node = breakStatement;
    if (breakStatement.whiteSpace.useDefault) {
      this.currentPrecedingIndentation = this.getCurrentPrecedingIndentation();
      this.replaceCurrentPrecedingIndentation(this.getIndentation());
    }
    this.appendSource(breakStatement.getStatementString());
  }

  visitBreakStatement(breakStatement) {
  }

  endVisitBreakStatement(breakStatement) {
    this.appendSource(`${breakStatement.getWSRegion(1)};${
                             breakStatement.getWSRegion(2)}`);
    this.appendSource((breakStatement.whiteSpace.useDefault)
            ? this.currentPrecedingIndentation : '');
    this.getParent().appendSource(this.getGeneratedSource());
  }
}

export default BreakStatementVisitor;
