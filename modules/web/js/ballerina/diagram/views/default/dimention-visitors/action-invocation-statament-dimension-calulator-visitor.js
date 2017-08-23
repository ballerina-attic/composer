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
import { util } from '../sizing-util';
import BallerinaASTFactory from './../../../../ast/ast-factory';

/**
 * Dimension visitor for action invocation statement.
 *
 * @class ActionInvocationStatementDimensionCalculatorVisitor
 * */
class ActionInvocationStatementDimensionCalculatorVisitor {

    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf ActionInvocationStatementDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visit the visitor.
     *
     * @memberOf ActionInvocationStatementDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf ActionInvocationStatementDimensionCalculatorVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - Action invocation statement node
     *
     * @memberOf ActionInvocationStatementDimensionCalculatorVisitor
     * */
    endVisit(node) {
        util.populateSimpleStatementBBox(node.getStatementString(), node.getViewState());
        // set the statement box arrow state to true.
        const viewState = node.getViewState();
        const actionExpression = node.children[0];
        if (actionExpression.getConnector() !== undefined &&
            BallerinaASTFactory.isServiceDefinition(actionExpression.getConnector().getParent())) {
            viewState.components['statement-box'].arrow = true;
        }
    }
}

export default ActionInvocationStatementDimensionCalculatorVisitor;
