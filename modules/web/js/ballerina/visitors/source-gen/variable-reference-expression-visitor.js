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
import log from 'log';
import EventChannel from 'event_channel';
import AbstractExpressionSourceGenVisitor from './abstract-expression-source-gen-visitor';
import VariableDefinitionVisitor from './variable-definition-visitor';

class VariableReferenceExpressionVisitor extends AbstractExpressionSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitVariableReferenceExpression(expression) {
        return true;
    }

    beginVisitVariableReferenceExpression(expression) {
       log.debug('Begin Visit Variable Reference Expression');
    }

    visitVariableReferenceExpression(expression) {
        log.debug('Visit Variable Reference Expression');
    }

    endVisitVariableReferenceExpression(expression) {
        if (expression.getVariableReferenceName()) {
            this.appendSource(expression.getVariableReferenceName());
        }
        this.getParent().appendSource(this.getGeneratedSource());
        log.debug('End Visit Variable Reference Expression');
    }

    visitVariableDefinition(variableDefinition) {
        var variableDefinitionVisitor = new VariableDefinitionVisitor(this);
        variableDefinition.accept(variableDefinitionVisitor);
    }
}

export default VariableReferenceExpressionVisitor;
