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
import _ from 'lodash';
import ASTFactory from '../../../../ast/ast-factory';
import * as DesignerDefaults from '../designer-defaults';

/**
 * Position visitor class for Fork Join Statement.
 *
 * @class ForkJoinStatementPositionCalcVisitor
 * */
class ForkJoinStatementPositionCalcVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf ForkJoinStatementPositionCalcVisitor
     * */
    canVisit() {
        log.debug('can visit ForkJoinStatementPositionCalcVisitor');
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @param {ASTNode} node - Fork Join Statement node.
     *
     * @memberOf ForkJoinStatementPositionCalcVisitor
     * */
    beginVisit(node) {
        log.debug('visit ForkJoinStatementPositionCalcVisitor');
        const viewState = node.getViewState();
        const bBox = viewState.bBox;
        const parent = node.getParent();
        const parentViewState = parent.getViewState();
        const parentStatementContainer = parentViewState.components.statementContainer;
        const parentStatements = parent.filterChildren(child =>
        ASTFactory.isStatement(child) || ASTFactory.isExpression(child) || ASTFactory.isConnectorDeclaration(child));
        const currentIndex = _.findIndex(parentStatements, node);
        let y;

        /**
         * Here we center the statement based on the parent's statement container's dimensions
         * Always the statement container's width should be greater than the statements/expressions
         */
        if (parentStatementContainer.w < bBox.w) {
            const exception = {
                message: 'Invalid statement container width found, statement ' +
                'width should be greater than or equal to statement/ statement width ',
            };
            throw exception;
        }
        const x = parentStatementContainer.x + ((parentStatementContainer.w - bBox.w) / 2);
        if (currentIndex === 0) {
            y = parentStatementContainer.y;
        } else if (currentIndex > 0) {
            const previousChild = parentStatements[currentIndex - 1];
            if (ASTFactory.isConnectorDeclaration(previousChild)) {
                y = previousChild.getViewState().components.statementViewState.bBox.getBottom();
            } else {
                y = previousChild.getViewState().bBox.getBottom();
            }
        } else {
            const exception = {
                message: `Invalid Index found for ${node.getType()}`,
            };
            throw exception;
        }

        bBox.x = x;
        bBox.y = y;

        const body = viewState.components.body;
        body.x = x;
        body.y = y + DesignerDefaults.statement.gutter.v + DesignerDefaults.blockStatement.heading.height;
    }

    /**
     * visit the visitor.
     *
     * @memberOf ForkJoinStatementPositionCalcVisitor
     * */
    visit() {
        log.debug('visit ForkJoinStatementPositionCalcVisitor');
    }

    /**
     * visit the visitor at the end.
     *
     * @memberOf ForkJoinStatementPositionCalcVisitor
     * */
    endVisit() {
        log.debug('end visit ForkJoinStatementPositionCalcVisitor');
    }
}

export default ForkJoinStatementPositionCalcVisitor;
