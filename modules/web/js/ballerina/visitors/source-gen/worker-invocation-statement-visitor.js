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
import AbstractStatementSourceGenVisitor from './abstract-statement-source-gen-visitor';
import WorkerInvocationStatement from '../../ast/statements/worker-invocation-statement';

class WorkerInvocationStatementVisitor extends AbstractStatementSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitWorkerInvocationStatement(workerInvocationStatement) {
        return workerInvocationStatement instanceof WorkerInvocationStatement;
    }

    beginVisitWorkerInvocationStatement(workerInvocationStatement) {
        const statementTokens = workerInvocationStatement.getInvocationStatement().split('->');
        let startIndentation;
        if (workerInvocationStatement.shouldCalculateIndentation) {
            startIndentation = this.getIndentation();
        } else {
            startIndentation = workerInvocationStatement.whiteSpaceDescriptor.regions[0];
        }

        let generatedStatement = startIndentation + statementTokens[0] +
            workerInvocationStatement.whiteSpaceDescriptor.regions[1] + '->' +
            workerInvocationStatement.whiteSpaceDescriptor.regions[2] + statementTokens[1];
        this.appendSource(generatedStatement);
        log.debug('Begin Visit Worker Invocation Statement');
    }

    endVisitWorkerInvocationStatement(workerInvocationStatement) {
        this.getParent().appendSource(this.getGeneratedSource() +
            workerInvocationStatement.whiteSpaceDescriptor.regions[3] + ";" +
            workerInvocationStatement.whiteSpaceDescriptor.regions[4]);
        log.debug('End Visit Worker Invocation Statement');
    }
}

export default WorkerInvocationStatementVisitor;
