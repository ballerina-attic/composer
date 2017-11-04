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
import AbstractBlockNode from './abstract-tree/block-node';
import TreeUtil from './../tree-util';

class BlockNode extends AbstractBlockNode {

    /**
     * Indicates whether the given instance of node can be accepted when dropped
     * on top of this node.
     *
     * @param {Node} node Node instance to be dropped
     * @param {Node} dropBefore before the node
     * @returns {Boolean} True if can be accepted.
     */
    canAcceptDrop(node, dropBefore) {
        const existingStatements = this.statements;
        let lastStatement;
        let isLastStatementReturn = false;
        let isLastStatementNext = false;
        if (!dropBefore && existingStatements.length > 0) {
            lastStatement = existingStatements[existingStatements.length - 1];
            isLastStatementReturn = lastStatement ? TreeUtil.isReturn(lastStatement) : false;
            isLastStatementNext = lastStatement ? TreeUtil.isNext(lastStatement) : false;
        }
        return (node.isStatement && !TreeUtil.isEndpointTypeVariableDef(node) && !isLastStatementReturn
            && !isLastStatementNext) || TreeUtil.isXmlns(node);
    }

    /**
     * Accept a node which is dropped
     * on top of this node.
     *
     * @param {Node} node Node instance to be dropped
     * @param {Node} dropBefore Drop before given node
     *
     */
    acceptDrop(node, dropBefore) {
        const index = !_.isNil(dropBefore) ? this.getIndexOfStatements(dropBefore) : -1;
        if (TreeUtil.isAssignment(node)) {
            const variables = node.getVariables();
            TreeUtil.getNewTempVarName(this, 'var', variables.length)
                .then((varNames) => {
                    variables.forEach((variable, i) => {
                        variable.getVariableName().setValue(varNames[i]);
                    });
                    this.addStatements(node, index);
                });
        } else if (TreeUtil.isVariableDef(node)) {
            TreeUtil.getNewTempVarName(this, 'var')
                .then((varNames) => {
                    node.getVariable().getName().setValue(varNames[0]);
                    this.addStatements(node, index);
                });
        } else {
            this.addStatements(node, index);
        }
    }
}

export default BlockNode;
