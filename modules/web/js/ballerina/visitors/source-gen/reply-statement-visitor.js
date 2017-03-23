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
import AbstractStatementSourceGenVisitor from './abstract-statement-source-gen-visitor';

class ReplyStatementVisitor extends AbstractStatementSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitReplyStatement(replyStatement) {
        return true;
    }

    beginVisitReplyStatement(replyStatement) {
        /**
         * set the configuration start for the reply statement definition language construct
         * If we need to add additional parameters which are dynamically added to the configuration start
         * that particular source generation has to be constructed here
         */
        this.appendSource('reply ');
        log.debug('Begin Visit Reply Statement Definition');
    }

    visitReplyStatement(replyStatement) {
        log.debug('Visit Reply Statement Definition');
    }

    endVisitReplyStatement(replyStatement) {
        this.appendSource(replyStatement.getReplyMessage() + ";\n");
        this.getParent().appendSource(this.getGeneratedSource());
        log.debug('End Visit Reply Statement Definition');
    }
}

export default ReplyStatementVisitor;
