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
import * as DesignerDefaults from '../designer-defaults';
import SimpleBBox from './../../../../ast/simple-bounding-box';

/**
 * Dimension visitor class for Transaction Aborted Statement.
 *
 * @class TransactionAbortedStatementDimensionCalculatorVisitor
 * */
class TransactionAbortedStatementDimensionCalculatorVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf TransactionAbortedStatementDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @memberOf TransactionAbortedStatementDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf TransactionAbortedStatementDimensionCalculatorVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - Transaction Aborted Statement node.
     *
     * @memberOf TransactionAbortedStatementDimensionCalculatorVisitor
     * */
    endVisit(node) {
        const viewState = node.getViewState();
        let statementWidth = 0;
        let statementHeight = 0;
        const sortedChildren = _.sortBy(node.getChildren(), child => child.getViewState().bBox.w);
        const sortedChildrenfromConnectors = _.sortBy(node.getChildren(), child => child.getViewState().bBox.expansionW);
        if (sortedChildren.length <= 0) {
            const exception = {
                message: 'Invalid number of children for Transaction-Aborted statement',
            };
            throw exception;
        }

        const childWithMaxWidth = sortedChildren[sortedChildren.length - 1];
        statementWidth = childWithMaxWidth.getViewState().bBox.w;

        const childWithMaxConnectorWidth = sortedChildrenfromConnectors[sortedChildrenfromConnectors.length - 1];
        const maxConnectorWidth = childWithMaxConnectorWidth.getViewState().bBox.expansionW;

        _.forEach(node.getChildren(), (child) => {
            if (child.id !== childWithMaxWidth.id) {
                child.getViewState().components.statementContainer.w =
                    childWithMaxWidth.getViewState().components.statementContainer.w;
                child.getViewState().bBox.w = childWithMaxWidth.getViewState().bBox.w;
            }
            if (child.getViewState().bBox.expansionW < maxConnectorWidth) {
                child.getViewState().bBox.expansionW = maxConnectorWidth;
            }
            statementHeight += child.getViewState().bBox.h;
        });

        const dropZoneHeight = DesignerDefaults.statement.gutter.v;
        viewState.components['drop-zone'] = new SimpleBBox();
        viewState.components['drop-zone'].h = dropZoneHeight;

        viewState.bBox.h = statementHeight + dropZoneHeight;
        viewState.bBox.w = statementWidth;
        viewState.bBox.expansionW = maxConnectorWidth;
    }
}

export default TransactionAbortedStatementDimensionCalculatorVisitor;
