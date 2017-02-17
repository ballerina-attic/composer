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
define(['require', 'lodash', 'log', 'event_channel', './abstract-statement-source-gen-visitor', '../../ast/module',
        './expression-visitor-factory', './function-invocation-expression-visitor'],
    function (require, _, log, EventChannel, AbstractStatementSourceGenVisitor, AST, ExpressionVisitorFactory, FunctionInvocationExpressionVisitor) {

        var RightOperandExpressionVisitor = function (parent) {
            AbstractStatementSourceGenVisitor.call(this, parent);
        };

        RightOperandExpressionVisitor.prototype = Object.create(AbstractStatementSourceGenVisitor.prototype);
        RightOperandExpressionVisitor.prototype.constructor = RightOperandExpressionVisitor;

        RightOperandExpressionVisitor.prototype.canVisitRightOperandExpression = function (rightOperandExpression) {
            return true;
        };

        RightOperandExpressionVisitor.prototype.beginVisitRightOperandExpression = function (rightOperandExpression) {
            //FIXME: Need to refactor this if logic
            this.appendSource(" = ");
            if (!_.isUndefined(rightOperandExpression.getRightOperandExpressionString()) &&
                (!_.isUndefined(rightOperandExpression.getChildren()) && !AST.BallerinaASTFactory.isFunctionInvocationStatement(rightOperandExpression.getChildren()[0]))) {
                this.appendSource(rightOperandExpression.getRightOperandExpressionString());
            }
            log.debug('Begin Visit Right Operand Expression');
        };

        RightOperandExpressionVisitor.prototype.endVisitRightOperandExpression = function (rightOperandExpression) {
            this.getParent().appendSource(this.getGeneratedSource());
            log.debug('End Visit Right Operand Expression');
        };

        RightOperandExpressionVisitor.prototype.visitFuncInvocationStatement = function (statement) {
            var StatementVisitorFactory = require('./statement-visitor-factory');
            var statementVisitorFactory = new StatementVisitorFactory();
            var statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
            statement.accept(statementVisitor);
        };

        RightOperandExpressionVisitor.prototype.visitExpression = function (expression) {
            var expressionVisitorFactory = new ExpressionVisitorFactory();
            var expressionVisitor = expressionVisitorFactory.getExpressionView({model: expression, parent: this});
            expression.accept(expressionVisitor);
            log.debug('Visit Expression');
        };

        RightOperandExpressionVisitor.prototype.visitFuncInvocationExpression = function (functionInvocation) {
            var args = {model: functionInvocation, parent: this};
            functionInvocation.accept(new FunctionInvocationExpressionVisitor(_.get(args, "parent")));
            log.debug('Visit Function Invocation expression');
        };

        return RightOperandExpressionVisitor;
    });