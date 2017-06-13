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
import _ from 'lodash';
import log from 'log';
import AbstractStatementSourceGenVisitor from './abstract-statement-source-gen-visitor';
import StatementVisitorFactory from './statement-visitor-factory';

class CatchStatementVisitor extends AbstractStatementSourceGenVisitor {
  constructor(parent) {
    super(parent);
  }

  canVisitCatchStatement(catchStatement) {
    return true;
  }

  beginVisitCatchStatement(catchStatement) {
    this.node = catchStatement;
        /**
         * set the configuration start for the catch statement
         * If we need to add additional parameters which are dynamically added to the configuration start
         * that particular source generation has to be constructed here
         */
    this.appendSource(`catch${catchStatement.getWSRegion(1)}(${
                             catchStatement.getWSRegion(2)
                             }${catchStatement.getParameterDefString() // FIXME fix the model to support different catches
                             }${catchStatement.getWSRegion(4)})${
                             catchStatement.getWSRegion(5)}{${
                             catchStatement.getWSRegion(6)}`);
    this.appendSource((catchStatement.whiteSpace.useDefault) ? this.getIndentation() : '');
    this.indent();
  }

  visitStatement(statement) {
    if (!_.isEqual(this.node, statement)) {
      const statementVisitorFactory = new StatementVisitorFactory();
      const statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
      statement.accept(statementVisitor);
    }
  }

  endVisitCatchStatement(catchStatement) {
    this.outdent();
    this.appendSource(`}${catchStatement.getWSRegion(7)}`);
    this.getParent().appendSource(this.getGeneratedSource());
  }
}

export default CatchStatementVisitor;
