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
        this.appendSource(workerInvocationStatement.getInvocationStatement());
        log.debug('Begin Visit Worker Invocation Statement');
    }

    endVisitWorkerInvocationStatement(workerInvocationStatement) {
        this.getParent().appendSource(this.getGeneratedSource() + ";\n");
        log.debug('End Visit Worker Invocation Statement');
    }
}

export default WorkerInvocationStatementVisitor;
