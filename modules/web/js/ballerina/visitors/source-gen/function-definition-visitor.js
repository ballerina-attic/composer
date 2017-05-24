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
import EventChannel from 'event_channel';
import AbstractSourceGenVisitor from './abstract-source-gen-visitor';
import StatementVisitorFactory from './statement-visitor-factory';
import ConnectorDeclarationVisitor from './connector-declaration-visitor';
import VariableDeclarationVisitor from './variable-declaration-visitor';
import WorkerDeclarationVisitor from './worker-declaration-visitor';

/**
 * @param parent
 * @constructor
 */
class FunctionDefinitionVisitor extends AbstractSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitFunctionDefinition(functionDefinition) {
        return true;
    }

    beginVisitFunctionDefinition(functionDefinition) {
        /**
         * set the configuration start for the function definition language construct
         * If we need to add additional parameters which are dynamically added to the configuration start
         * that particular source generation has to be constructed here
         */
        let functionReturnTypes = functionDefinition.getReturnTypesAsString();
        let functionReturnTypesSource = '';

        if (!_.isEmpty(functionReturnTypes)) {
            functionReturnTypesSource = '(' + functionDefinition.getReturnTypesAsString() + ') ';
        }

        let constructedSourceSegment = '\n';
        _.forEach(functionDefinition.getChildrenOfType(functionDefinition.getFactory().isAnnotation), annotationNode => {
            if (annotationNode.isSupported()) {
                constructedSourceSegment += annotationNode.toString() + '\n';
            }
        });
        let startIndentation;
        if (functionDefinition.shouldCalculateIndentation) {
            startIndentation = this.getIndentation();
        } else {
            startIndentation = '';
        }
        constructedSourceSegment += startIndentation + 'function' +
            functionDefinition.whiteSpaceDescriptor.regions[1] + functionDefinition.getFunctionName() + '(' +
            functionDefinition.getArgumentsAsString() + ')' + functionDefinition.whiteSpaceDescriptor.regions[2] +
            functionReturnTypesSource + functionDefinition.whiteSpaceDescriptor.regions[6] + '{' +
            functionDefinition.whiteSpaceDescriptor.regions[7];
        this.appendSource(constructedSourceSegment);
        this.indent();
        log.debug('Begin Visit FunctionDefinition');
    }

    visitFunctionDefinition(functionDefinition) {
        log.debug('Visit FunctionDefinition');
    }

    endVisitFunctionDefinition(functionDefinition) {
        this.outdent();
        this.appendSource("}\n");
        this.getParent().appendSource(this.getIndentation() + this.getGeneratedSource());
        log.debug('End Visit FunctionDefinition');
    }

    visitStatement(statement) {
        var statementVisitorFactory = new StatementVisitorFactory();
        var statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
        statement.accept(statementVisitor);
    }

    /**
     * visits commentStatement
     * @param {Object} statement - comment statement
     */
    visitCommentStatement(statement) {
        var statementVisitorFactory = new StatementVisitorFactory();
        var statementVisitor = statementVisitorFactory.getStatementVisitor(statement, this);
        statement.accept(statementVisitor);
    }

    visitConnectorDeclaration(connectorDeclaration) {
        var connectorDeclarationVisitor = new ConnectorDeclarationVisitor(this);
        connectorDeclaration.accept(connectorDeclarationVisitor);
    }

    visitVariableDeclaration(variableDeclaration) {
        var variableDeclarationVisitor = new VariableDeclarationVisitor(this);
        variableDeclaration.accept(variableDeclarationVisitor);
    }

    visitWorkerDeclaration(workerDeclaration) {
        var workerDeclarationVisitor = new WorkerDeclarationVisitor(this);
        workerDeclaration.accept(workerDeclarationVisitor);
    }
}

export default FunctionDefinitionVisitor;
