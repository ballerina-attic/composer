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
import { blockStatement } from '../designer-defaults';
import { util } from '../sizing-util';

/**
 * Position visitor class for Join Statement.
 *
 * @class JoinStatementPositionCalcVisitor
 * */
class JoinStatementPositionCalcVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf JoinStatementPositionCalcVisitor
     * */
    canVisit() {
        log.debug('can visit JoinStatementPositionCalcVisitor');
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @param {ASTNode} node - Join Statement node.
     *
     * @memberOf JoinStatementPositionCalcVisitor
     * */
    beginVisit(node) {
        log.debug('visit JoinStatementPositionCalcVisitor');
        const viewState = node.getViewState();
        const bBox = viewState.bBox;
        const parent = node.getParent();
        const parentViewState = parent.getViewState();
        const forkBBox = parentViewState.components.body;
        bBox.x = forkBBox.x;
        bBox.y = forkBBox.getBottom();
        const components = viewState.components;
        components.statementContainer.x = bBox.x;
        components.statementContainer.y = bBox.y + blockStatement.heading.height;

        const titleW = blockStatement.heading.width;
        const typeWidth = util.getTextWidth(node.getJoinConditionString(), 3);
        components.param.x = bBox.x + titleW + blockStatement.heading.paramSeparatorOffsetX + typeWidth.w;
        components.param.y = bBox.y;
    }

    /**
     * visit the visitor.
     *
     * @memberOf JoinStatementPositionCalcVisitor
     * */
    visit() {
        log.debug('visit JoinStatementPositionCalcVisitor');
    }

    /**
     * visit the visitor at the end.
     *
     * @memberOf JoinStatementPositionCalcVisitor
     * */
    endVisit() {
        log.debug('end visit JoinStatementPositionCalcVisitor');
    }
}

export default JoinStatementPositionCalcVisitor;
