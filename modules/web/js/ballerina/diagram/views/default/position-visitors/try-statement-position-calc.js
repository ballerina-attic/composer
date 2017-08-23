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
import * as DesignerDefaults from '../designer-defaults';

/**
 * Position visitor class for Try Statement.
 *
 * @class TryStatementPositionCalcVisitor
 * */
class TryStatementPositionCalcVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf TryStatementPositionCalcVisitor
     * */
    canVisit() {
        log.debug('can visit TryStatementPositionCalcVisitor');
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @param {ASTNode} node - Try statement node.
     *
     * @memberOf TryStatementPositionCalcVisitor
     * */
    beginVisit(node) {
        log.debug('visit TryStatementPositionCalcVisitor');
        const parentViewState = node.getParent().getViewState();
        const parentBBox = parentViewState.bBox;
        const viewState = node.getViewState();
        const bBox = viewState.bBox;

        const x = parentBBox.x;
        const y = parentBBox.y + parentViewState.components['drop-zone'].h;
        const statementContainerX = x;
        const statementContainerY = y + DesignerDefaults.blockStatement.heading.height;

        bBox.x = x;
        bBox.y = y;
        viewState.components.statementContainer.x = statementContainerX;
        viewState.components.statementContainer.y = statementContainerY;
    }

    /**
     * visit the visitor.
     *
     * @memberOf TryStatementPositionCalcVisitor
     * */
    visit() {
        log.debug('visit TryStatementPositionCalcVisitor');
    }

    /**
     * visit the visitor at the end.
     *
     * @memberOf TryStatementPositionCalcVisitor
     * */
    endVisit() {
        log.debug('end visit TryStatementPositionCalcVisitor');
    }
}

export default TryStatementPositionCalcVisitor;
