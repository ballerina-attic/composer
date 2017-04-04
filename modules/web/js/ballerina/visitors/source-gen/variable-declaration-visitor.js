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
import AST from '../../ast/module';

class VariableDeclarationVisitor extends AbstractSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitVariableDeclaration(variableDeclaration) {
        return true;
    }

    beginVisitVariableDeclaration(variableDeclaration) {
        this.appendSource(variableDeclaration.getType() + " " +variableDeclaration.getIdentifier());
        log.debug('Begin Visit Variable Declaration');
    }

    visitVariableDeclaration(variableDeclaration) {
        log.debug('Visit Variable Declaration');
    }

    endVisitVariableDeclaration(variableDeclaration) {
        this.appendSource(";\n");
        this.getParent().appendSource(this.getGeneratedSource());
        log.debug('End Visit Variable Declaration');
    }
}

export default VariableDeclarationVisitor;
