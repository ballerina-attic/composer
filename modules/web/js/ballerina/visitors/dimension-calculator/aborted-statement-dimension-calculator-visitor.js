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
import log from 'log';
import {util} from './../sizing-utils';
import {blockStatement} from './../../configs/designer-defaults.js';

class AbortedStatementDimensionCalculatorVisitor {
    canVisit(node) {
        log.debug('can visit AbortedStatementDimensionCalculatorVisitor');
        return true;
    }

    beginVisit(node) {
        log.debug('begin visit AbortedStatementDimensionCalculatorVisitor');
    }

    visit(node) {
        log.debug('visit AbortedStatementDimensionCalculatorVisitor');
    }

    endVisit(node) {
        log.debug('end visit AbortedStatementDimensionCalculatorVisitor');
        util.populateCompoundStatementChild(node);

        /// Calculate the title width and height as to the keyword width.
        let viewState = node.getViewState();
        viewState.title = {
            w: 0,
            h: 0
        };

        viewState.title.w = util.getTextWidth('Aborted').w;
        viewState.title.h = blockStatement.heading.height;
    }
}

export default AbortedStatementDimensionCalculatorVisitor;