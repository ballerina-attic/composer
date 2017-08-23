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

import SizingUtil from './../sizing-util';
import BallerinaASTFactory from './../../../../ast/ast-factory';
import DimensionCalculatorVisitor from '../../../dimension-visitor';

/**
 * Dimension visitor class for Variable Definition Statement.
 *
 * @class VariableDefinitionStatementDimensionCalculatorVisitor
 * */
class VariableDefinitionStatementDimensionCalculatorVisitor {

    /**
     * Constructor for Variable Definition statement dimensions
     * @param {object} options - options
     */
    constructor(options) {
        this.sizingUtil = new SizingUtil(options);
    }

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf VariableDefinitionStatementDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @memberOf VariableDefinitionStatementDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf VariableDefinitionStatementDimensionCalculatorVisitor
     * */
    visit(node) {
        // TODO: this visit can be removed making all lambdas children of the node.
        node.getLambdaChildren().forEach(f => f.accept(new DimensionCalculatorVisitor()));
    }

    /**
     * visit the visitor at the end.
     *
     * @param {VariableDefinitionStatement} node - Variable Definition Statement node.
     *
     * @memberOf VariableDefinitionStatementDimensionCalculatorVisitor
     * */
    endVisit(node) {
        const viewState = node.getViewState();
        this.sizingUtil.populateSimpleStatementBBox(node.getStatementString(), viewState);

        node.getLambdaChildren().forEach((f) => {
            const funcViewState = f.getViewState();
            viewState.bBox.h += funcViewState.bBox.h;
            viewState.bBox.w = Math.max(funcViewState.bBox.w, viewState.bBox.w);
        });

        // check if it is an action invocation statement if so initialize it as an arrow.
        const statementChildren = node.filterChildren(BallerinaASTFactory.isActionInvocationExpression);
        if (statementChildren instanceof Array && statementChildren.length > 0) {
            const action = statementChildren[0];
            // if the arrow is drawn to a connector in service level we will mark it as a conflict.
            if (action.getConnector() !== undefined &&
               BallerinaASTFactory.isServiceDefinition(action.getConnector().getParent())) {
                viewState.components['statement-box'].arrow = true;
            }
        }
    }
}

export default VariableDefinitionStatementDimensionCalculatorVisitor;
