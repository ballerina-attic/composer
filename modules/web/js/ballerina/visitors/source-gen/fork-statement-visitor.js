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
define(['require', 'lodash', 'log', 'event_channel', './abstract-statement-source-gen-visitor'], function (require, _, log, EventChannel, AbstractStatementSourceGenVisitor) {

    var ForkStatementVisitor = function (parent) {
        AbstractStatementSourceGenVisitor.call(this, parent);
    };

    ForkStatementVisitor.prototype = Object.create(AbstractStatementSourceGenVisitor.prototype);
    ForkStatementVisitor.prototype.constructor = ForkStatementVisitor;

    ForkStatementVisitor.prototype.canVisitForkStatement = function (forkStatement) {
        return true;
    };

    ForkStatementVisitor.prototype.beginVisitForkStatement = function (forkStatement) {
        //TODO Need to read input parameter for the fork statement dynamically
        // this.appendSource('fork (' + forkStatement.getParameter() + '){');
        this.appendSource('fork (message m){');
        log.debug('Begin Visit Fork Statement');
    };

    ForkStatementVisitor.prototype.visitForkStatement = function (forkStatement) {
        log.debug('Visit Fork Statement');
    };

    ForkStatementVisitor.prototype.endVisitForkStatement = function (forkStatement) {
        this.appendSource("}\n");
        this.getParent().appendSource(this.getGeneratedSource());
        log.debug('End Visit Fork Statement');
    };

    ForkStatementVisitor.prototype.visitStatement = function(statement){
        var StatementVisitorFactory = require('./statement-visitor-factory');
        var statementVisitorFactory = new StatementVisitorFactory();
        var statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
        statement.accept(statementVisitor);
    };

    return ForkStatementVisitor;
});
