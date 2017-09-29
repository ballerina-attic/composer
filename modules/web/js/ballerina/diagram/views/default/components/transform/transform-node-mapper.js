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
import ASTFactory from '../../../../../ast/ast-factory';
import TreeUtil from '../../../../../model/tree-util';
import DefaultASTFactory from '../../../../../ast/default-ast-factory';

const ExpressionType = {
    ERROR: 'error',
    PLACEHOLDER: 'placeholder',
    TEMPVAR: 'tempvar',
    DIRECT: 'direct',
    CONST: 'const',
};

const VarPrefix = {
    TEMP: '__temp',
    OUTPUT: '__output',
};

/**
 * Performs utility methods for handling transform inner statement creation and removal
 * @class TransformNodeMapper
 */
class TransformNodeMapper {

    /**
     * Creates an instance of TransformNodeMapper.
     * @param {any} args arguments
     * @memberof TransformNodeMapper
     */
    constructor(args) {
        this._transformStmt = _.get(args, 'transformStmt');
    }

    /**
     * Set transform statement
     * @param {any} transformStmt transform statement
     * @memberof TransformNodeMapper
     */
    setTransformStmt(transformStmt) {
        this._transformStmt = transformStmt;
    }

    // **** CREATE MAPPING FUNCTIONS **** //

    /**
     * Create a direct source variable to direct target variable mapping
     * @param {Expression} sourceExpression source expression
     * @param {Expression} targetExpression target expression
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createInputToOutputMapping(sourceExpression, targetExpression, compatibility) {
        this.validateTargetMappings(targetExpression);

        const assignmentStmt = ASTFactory.createAssignmentStatement();
        const varRefList = ASTFactory.createVariableReferenceList();
        varRefList.addChild(targetExpression);
        assignmentStmt.addChild(varRefList, 0);

        assignmentStmt.addChild(sourceExpression, 1);

        if (!compatibility.safe) {
            const errorVarRef = DefaultASTFactory.createIgnoreErrorVariableReference();
            varRefList.addChild(errorVarRef);
        }
        this._transformStmt.addChild(assignmentStmt);
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping ${sourceExpression.getExpressionString()} to ${targetExpression.getExpressionString()}`,
            data: {},
        });
    }

    /**
     * Create direct input variable to a function node mapping.
     * @param {Expression} sourceExpression source expression
     * @param {any} target target function node definition
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createInputToFunctionMapping(sourceExpression, target, compatibility) {
        const funcNode = target.funcInv;
        const index = target.index;

        let refType = ASTFactory.createReferenceTypeInitExpression();
        if (target.isField &&
            ASTFactory.isReferenceTypeInitExpression(funcNode.children[index])) {
            refType = funcNode.children[index];
        }
        funcNode.removeChild(funcNode.children[index], true);
        // check function parameter is a struct and mapping is a complex mapping
        if (target.isField && _.find(this.state.vertices, (struct) => {
            return struct.typeName === this.getFunctionVertices(funcNode).parameters[index].type;
        })) {
            const keyValEx = ASTFactory.createKeyValueExpression();
            const nameVarRefExpression = ASTFactory.createSimpleVariableReferenceExpression();

            const propChain = (target.name).split('.').splice(1);

            nameVarRefExpression.setExpressionFromString(propChain[0]);
            keyValEx.addChild(nameVarRefExpression);
            keyValEx.addChild(sourceExpression);
            refType.addChild(keyValEx);
            funcNode.addChild(refType, index);
        } else if (compatibility.safe) {
            funcNode.addChild(sourceExpression, index);
        } else {
            const assignmentStmt = this.findEnclosingAssignmentStatement(funcNode);
            const argumentExpression = this.getTempVertexExpression(sourceExpression,
                                            this._transformStmt.getIndexOfChild(assignmentStmt));
            funcNode.addChild(argumentExpression, index);
        }
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping ${sourceExpression.getExpressionString()} to ${funcNode.getFunctionName()}`,
            data: {},
        });
    }

    /**
     * Create direct input to operator mapping
     * @param {any} sourceExpression source expression
     * @param {any} target target
     * @param {any} compatibility compatibility
     * @memberof TransformNodeMapper
     */
    createInputToOperatorMapping(sourceExpression, target, compatibility) {
        if (ASTFactory.isBinaryExpression(target.operator)) {
            this.createInputToBinaryOperatorMapping(sourceExpression, target, compatibility);
        } else if (ASTFactory.isUnaryExpression(target.operator)) {
            this.createInputToUnaryOperatorMapping(sourceExpression, target, compatibility);
        }
    }

    /**
     * Create direct input variable to a binary operator node mapping.
     * @param {Expression} sourceExpression source expression
     * @param {any} target target operator node definition
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createInputToBinaryOperatorMapping(sourceExpression, target, compatibility) {
        const operatorNode = target.operator;
        const index = target.index;

        if (compatibility.safe) {
            if (index === 0) {
                operatorNode.setLeftExpression(sourceExpression, { doSilently: true });
            } else {
                operatorNode.setRightExpression(sourceExpression, { doSilently: true });
            }
        } else {
            const assignmentStmt = this.findEnclosingAssignmentStatement(operatorNode);
            const argumentExpression = this.getTempVertexExpression(sourceExpression,
                                            this._transformStmt.getIndexOfChild(assignmentStmt));
            operatorNode.addChild(argumentExpression, index, true);
        }
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping ${sourceExpression.getExpressionString()} to operator ${operatorNode.getOperator()}`,
            data: {},
        });
    }

    /**
     * Create direct input variable to a unary operator node mapping.
     * @param {Expression} sourceExpression source expression
     * @param {any} target target operator node definition
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createInputToUnaryOperatorMapping(sourceExpression, target, compatibility) {
        const operatorNode = target.operator;
        const index = target.index;

        if (compatibility.safe) {
            operatorNode.setRightExpression(sourceExpression);
            return;
        }

        const assignmentStmt = this.findEnclosingAssignmentStatement(operatorNode);
        const argumentExpression = this.getTempVertexExpression(sourceExpression,
            this._transformStmt.getIndexOfChild(assignmentStmt));

        operatorNode.addChild(argumentExpression, index);
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping ${sourceExpression.getExpressionString()} to operator ${operatorNode.getOperator()}`,
            data: {},
        });
    }

    /**
     * Create function node to direct output variable mapping.
     * @param {Expression} targetExpression target expression
     * @param {any} source source function node definition
     * @param {any} target target variable definition
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createFunctionToOutputMapping(targetExpression, source, target, compatibility) {
        this.validateTargetMappings(targetExpression);

        const assignmentStmt = this.findEnclosingAssignmentStatement(source.funcInv);
        if (!assignmentStmt) {
            log.error('Cannot find assignment statement containing the function invocation '
                        + source.funcInv.getFunctionName());
            return;
        }
        const rightExpression = this.getCompatibleSourceExpression(
            this.getMappableExpression(source.funcInv), compatibility.type, target.type);

        const outputExpressions = this.getOutputExpressions(assignmentStmt);

        if (outputExpressions[source.index].type === ExpressionType.TEMPVAR) {
            const tempVarRefExpr = outputExpressions[source.index].expression;
            const newAssignmentStmt = ASTFactory.createAssignmentStatement();
            const varRefList = ASTFactory.createVariableReferenceList();
            varRefList.addChild(targetExpression, true);
            newAssignmentStmt.addChild(varRefList, 0, true);
            newAssignmentStmt.addChild(tempVarRefExpr, 1, true);
            this._transformStmt.addChild(newAssignmentStmt, true);
        } else if (outputExpressions[source.index].type === ExpressionType.PLACEHOLDER) {
            assignmentStmt.replaceChildByIndex(rightExpression, 1, true);

            assignmentStmt.getLeftExpression().replaceChildByIndex(targetExpression, source.index, true);
            // TODO: conditionally remove var if all outputs are mapped
            assignmentStmt.setIsDeclaredWithVar(false, true);

            if (!compatibility.safe) {
                // TODO: only add error reference if there is not one already
                // TODO: also remove error variable if no longer required
                const errorVarRef = DefaultASTFactory.createIgnoreErrorVariableReference();
                assignmentStmt.getLeftExpression().addChild(errorVarRef, true);
            }
        } else if (outputExpressions[source.index].type === ExpressionType.DIRECT) {
            const tempVarName = this.assignToTempVariable(assignmentStmt);
            const tempVarRefExpr = ASTFactory.createSimpleVariableReferenceExpression({ variableName: tempVarName });
            assignmentStmt.replaceChildByIndex(tempVarRefExpr, 1, true);

            const newAssignmentStmt = ASTFactory.createAssignmentStatement();
            const varRefList = ASTFactory.createVariableReferenceList();
            varRefList.addChild(targetExpression, source.index, true);
            newAssignmentStmt.addChild(varRefList, 0, true);
            newAssignmentStmt.addChild(tempVarRefExpr, 1, true);
            this._transformStmt.addChild(newAssignmentStmt, true);
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping ${source.name} to ${target.name}`,
            data: {},
        });
    }

    /**
     * Create operator node to direct output variable mapping.
     * @param {Expression} targetExpression target expression
     * @param {any} source source function node definition
     * @param {any} target target variable definition
     * @param {any} compatibility compatibility of the mapping
     * @memberof TransformNodeMapper
     */
    createOperatorToOutputMapping(targetExpression, source, target, compatibility) {
        this.validateTargetMappings(targetExpression);

        const assignmentStmt = this.findEnclosingAssignmentStatement(source.operator);
        if (!assignmentStmt) {
            log.error('Cannot find assignment statement containing the operator '
                        + source.operator.getOperator());
            return;
        }
        const rightExpression = this.getCompatibleSourceExpression(
            this.getMappableExpression(source.operator), compatibility.type, target.type);

        const outputExpressions = this.getOutputExpressions(assignmentStmt);

        if (outputExpressions[0].type === ExpressionType.TEMPVAR) {
            const tempVarRefExpr = outputExpressions[source.index].expression;
            const newAssignmentStmt = ASTFactory.createAssignmentStatement();
            const varRefList = ASTFactory.createVariableReferenceList();
            varRefList.addChild(targetExpression, true);
            newAssignmentStmt.addChild(varRefList, 0, true);
            newAssignmentStmt.addChild(tempVarRefExpr, 1, true);
            this._transformStmt.addChild(newAssignmentStmt, true);
        } else if (outputExpressions[0].type === ExpressionType.PLACEHOLDER) {
            assignmentStmt.replaceChildByIndex(rightExpression, 1, true);

            assignmentStmt.getLeftExpression().replaceChildByIndex(targetExpression, 0, true);
            // TODO: conditionally remove var if all outputs are mapped
            assignmentStmt.setIsDeclaredWithVar(false, true);

            if (!compatibility.safe) {
                // TODO: only add error reference if there is not one already
                // TODO: also remove error variable if no longer required
                const errorVarRef = DefaultASTFactory.createIgnoreErrorVariableReference();
                assignmentStmt.getLeftExpression().addChild(errorVarRef, true);
            }
        } else if (outputExpressions[0].type === ExpressionType.DIRECT) {
            const tempVarName = this.assignToTempVariable(assignmentStmt);
            const tempVarRefExpr = ASTFactory.createSimpleVariableReferenceExpression({ variableName: tempVarName });
            assignmentStmt.replaceChildByIndex(tempVarRefExpr, 1, true);

            const newAssignmentStmt = ASTFactory.createAssignmentStatement();
            const varRefList = ASTFactory.createVariableReferenceList();
            varRefList.addChild(targetExpression, source.index, true);
            newAssignmentStmt.addChild(varRefList, 0, true);
            newAssignmentStmt.addChild(tempVarRefExpr, 1, true);
            this._transformStmt.addChild(newAssignmentStmt, true);
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping operator ${source.operator.getOperator()} to ${target.name}`,
            data: {},
        });
    }

    /**
     * Create complex node to node mappings. Complex nodes are functions and operators.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    createNodeToNodeMapping(source, target) {
        if (source.funcInv && target.funcInv) {
            this.createFunctionToFunctionMapping(source, target);
        } else if (source.funcInv && target.operator) {
            this.createFunctionToOperatorMapping(source, target);
        } else if (source.operator && target.funcInv) {
            this.createOperatorToFunctionMapping(source, target);
        } else if (source.operator && target.operator) {
            this.createOperatorToOperatorMapping(source, target);
        }
    }

    /**
     * Create function to function mapping
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    createFunctionToFunctionMapping(source, target) {
        const assignmentStmtSource = this.getParentAssignmentStmt(source.funcInv);
        // remove the source assignment statement since it is now included in the target assignment statement.
        this._transformStmt.removeChild(assignmentStmtSource, true);

        const currentChild = target.funcInv.getChildren()[target.index];
        if (currentChild) {
            target.funcInv.removeChild(currentChild, true);
        }

        target.funcInv.addChild(source.funcInv, target.index, true);
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping function ${source.funcInv.getFunctionName()} to function ${target.funcInv.getFunctionName()}`,
            data: {},
        });
    }

    /**
    * Create operator to operator mapping
    * @param {any} source source
    * @param {any} target target
    * @memberof TransformNodeMapper
    */
    createOperatorToOperatorMapping(source, target) {
        const assignmentStmtSource = this.getParentAssignmentStmt(source.operator);
        // remove the source assignment statement since it is now included in the target assignment statement.
        this._transformStmt.removeChild(assignmentStmtSource, true);

        if (target.index === 0) {
            target.operator.setLeftExpression(source.operator, { doSilently: true });
        } else if (target.index === 1) {
            target.operator.setRightExpression(source.operator, { doSilently: true });
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping operator ${source.operator.getOperator()} to operator ${target.operator.getOperator()}`,
            data: {},
        });
    }

    /**
     * Create operator to function mapping
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    createOperatorToFunctionMapping(source, target) {
        const assignmentStmtSource = this.getParentAssignmentStmt(source.operator);
        // remove the source assignment statement since it is now included in the target assignment statement.
        this._transformStmt.removeChild(assignmentStmtSource, true);

        const currentChild = target.funcInv.getChildren()[target.index];
        if (currentChild) {
            target.funcInv.removeChild(currentChild, true);
        }

        target.funcInv.addChild(source.operator, target.index, true);

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping operator ${source.operator.getOperator()} to function ${target.funcInv.getFunctionName()}`,
            data: {},
        });
    }

    /**
    * Create function to operator mapping
    * @param {any} source source
    * @param {any} target target
    * @memberof TransformNodeMapper
    */
    createFunctionToOperatorMapping(source, target) {
        const assignmentStmtSource = this.getParentAssignmentStmt(source.funcInv);
        // remove the source assignment statement since it is now included in the target assignment statement.
        this._transformStmt.removeChild(assignmentStmtSource, true);

        if (target.index === 0) {
            target.operator.setLeftExpression(source.funcInv, { doSilently: true });
        } else if (target.index === 1) {
            target.operator.setRightExpression(source.funcInv, { doSilently: true });
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-created',
            title: `Create mapping function ${source.funcInv.getFunctionName()} to operator ${target.operator.getOperator()}`,
            data: {},
        });
    }

    // **** REMOVE MAPPING FUNCTIONS **** //

    /**
     * Remove node which is a function or an operator. If there are nested nodes,
     * they are moved to a new assignment statement.
     * @param {any} nodeExpression node expression
     * @param {any} parentNode parent node
     * @param {any} statement enclosing statement
     * @memberof TransformNodeMapper
     */
    removeNode(nodeExpression, parentNode, statement) {
        const nestedNodes = [];
        let nodeName;
        if (ASTFactory.isFunctionInvocationExpression(nodeExpression)) {
            nodeName = nodeExpression.getFunctionName();
            nodeExpression.getChildren().forEach((paramExp) => {
                if (this.isComplexExpression(paramExp)) {
                    nestedNodes.push(paramExp);
                }
            });
        } else {
            nodeName = nodeExpression.getOperator();
            if (this.isComplexExpression(nodeExpression.getRightExpression())) {
                nestedNodes.push(nodeExpression.getRightExpression());
            }
            if (ASTFactory.isBinaryExpression(nodeExpression)
                        && this.isComplexExpression(nodeExpression.getLeftExpression())) {
                nestedNodes.push(nodeExpression.getLeftExpression());
            }
        }

        let statementIndex = this._transformStmt.getIndexOfChild(statement);
        statementIndex = (statementIndex === 0) ? 0 : statementIndex - 1;
        nestedNodes.forEach((node) => {
            const assignmentStmt = DefaultASTFactory
                    .createTransformAssignmentRightExpStatement({ rightExp: node });
            this._transformStmt.addChild(assignmentStmt, statementIndex, true);
        });

        if (!parentNode) {
            this._transformStmt.removeChild(statement, true);
        } else if (ASTFactory.isFunctionInvocationExpression(parentNode)) {
            parentNode.removeChild(nodeExpression, true);
        } else if (ASTFactory.isUnaryExpression(parentNode)
                    && (parentNode.getLeftExpression() === nodeExpression)) {
            parentNode.setLeftExpression(ASTFactory.createNullLiteralExpression(), { doSilently: true });
        } else {
            parentNode.setRightExpression(ASTFactory.createNullLiteralExpression(), { doSilently: true });
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping function ${nodeName}`,
            data: {},
        });
    }

    /**
     * Remove direct input to output mapping.
     * @param {any} sourceName source name
     * @param {any} targetName target name
     * @memberof TransformNodeMapper
     */
    removeInputToOutputMapping(sourceName, targetName) {
        const assignmentStmt = _.find(this._transformStmt.getChildren(), (child) => {
            if (ASTFactory.isAssignmentStatement(child)) {
                return child.getLeftExpression().getChildren().find((leftExpression) => {
                    const leftExpressionStr = leftExpression.getExpressionString().trim();
                    const rightExpressionStr = this.getMappableExpression(
                        child.getRightExpression()).getExpressionString().trim();
                    return (leftExpressionStr === targetName) && (rightExpressionStr === sourceName);
                });
            }
            return false;
        });
        this._transformStmt.removeChild(assignmentStmt, true);
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${sourceName} to ${targetName}`,
            data: {},
        });
    }

    /**
     * Remove function/operator node to output variable mapping.
     * @param {any} source source
     * @param {any} targetName target name
     * @memberof TransformNodeMapper
     */
    removeNodeToOutputMapping(source, targetName) {
        const nodeExpression = (source.funcInv) ? source.funcInv : source.operator;
        const nodeName = (source.funcInv) ? nodeExpression.getFunctionName() : nodeExpression.getOperator();

        const assignmentStmtSource = this.getParentAssignmentStmt(nodeExpression);
        const expression = assignmentStmtSource.getLeftExpression().getChildren().find((child) => {
            return (child.getExpressionString().trim() === targetName);
        });

        if (expression) {
            this.removeOutputExpressions(assignmentStmtSource, targetName);
             // const errExpression = _.find(assignmentStmtSource.getLeftExpression().getChildren(), (child) => {
            //     return (child.getExpressionString().trim() === '_');
            // });
            // assignmentStmtSource.getLeftExpression().removeChild(errExpression, true);
        } else {
            const assignedTempVars = this.getAssignedTempVariable(assignmentStmtSource);
            if (assignedTempVars) {
                assignedTempVars.forEach((tempVar) => {
                    const assStmts = this.getInputStatements(tempVar.expression);
                    assStmts.forEach((stmt) => {
                        this.removeOutputExpressions(stmt, targetName);
                    });
                    const assStmtNew = this.getInputStatements(tempVar.expression);
                    if (assStmtNew.length === 1) {
                        // remove the temp reference if there are no statement using the temp
                        assignmentStmtSource.getLeftExpression()
                            .replaceChild(tempVar.expression, assStmtNew[0].getLeftExpression().getChildren()[0], true);
                        assignmentStmtSource.setIsDeclaredWithVar(false);
                        this._transformStmt.removeChild(assStmtNew[0], true);
                    }
                });
            }
        }

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${nodeName} to ${targetName}`,
            data: {},
        });
    }

    /**
     * Remove input variable to function mapping.
     * @param {any} sourceName source name
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeInputToFunctionMapping(sourceName, target) {
        const functionInv = target.funcInv;
        const expression = _.find(functionInv.getChildren(), (child) => {
            return (this.getMappableExpression(child).getExpressionString().trim() === sourceName);
        });
        functionInv.replaceChildByIndex(ASTFactory.createNullLiteralExpression(), target.index, true);

        // TODO: work on this logic
        if (expression.getExpressionString().startsWith('__temp')) {
            // remove temp variable assignment if it is not used
            const tempUsages = this.findTempVarUsages(expression.getExpressionString());
            if (tempUsages.length === 0) {
                const tempAssignStmt = this.findAssignedVertexForTemp(expression);
                if (tempAssignStmt) {
                    this._transformStmt.removeChild(tempAssignStmt, true);
                }
            }
        }
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${sourceName} to ${functionInv.getFunctionName()}`,
            data: {},
        });
    }

    /**
     * Remove input variable to operator mapping.
     * @param {any} sourceName source name
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeInputToOperatorMapping(sourceName, target) {
        const operatorExp = target.operator;
        const defaultExp = ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 });

        if (this.getMappableExpression(operatorExp.getRightExpression()).getExpressionString().trim() === sourceName) {
            operatorExp.setRightExpression(defaultExp, { doSilently: true });
        } else if (ASTFactory.isBinaryExpression(operatorExp)
           && this.getMappableExpression(operatorExp.getLeftExpression()).getExpressionString().trim() === sourceName) {
            operatorExp.setLeftExpression(defaultExp, { doSilently: true });
        }

        // TODO: work on this logic
        // if (expression.getExpressionString().startsWith('__temp')) {
        //     // remove temp variable assignment if it is not used
        //     const tempUsages = this.findTempVarUsages(expression.getExpressionString());
        //     if (tempUsages.length === 0) {
        //         const tempAssignStmt = this.findAssignedVertexForTemp(expression);
        //         if (tempAssignStmt) {
        //             this._transformStmt.removeChild(tempAssignStmt, true);
        //         }
        //     }
        // }
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${sourceName} to ${operatorExp.getOperator()}`,
            data: {},
        });
    }

    /**
     * Remove complex node to node mappings. Complex nodes are functions and operators.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeNodeToNodeMapping(source, target) {
        if (source.funcInv && target.funcInv) {
            this.removeFunctionToFunctionMapping(source, target);
        } else if (source.funcInv && target.operator) {
            this.removeFunctionToOperatorMapping(source, target);
        } else if (source.operator && target.funcInv) {
            this.removeOperatorToFunctionMapping(source, target);
        } else if (source.operator && target.operator) {
            this.removeOperatorToOperatorMapping(source, target);
        }
    }

    /**
     * Remove function to function mapping.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeFunctionToFunctionMapping(source, target) {
        const assignmentStmt = this.getParentAssignmentStmt(target.funcInv);
        const newAssignIndex = this._transformStmt.getIndexOfChild(assignmentStmt);

        const index = target.funcInv.getIndexOfChild(source.funcInv);
        target.funcInv.replaceChild(source.funcInv, ASTFactory.createNullLiteralExpression(), index, true);

        const newAssignmentStmt = DefaultASTFactory
            .createTransformAssignmentRightExpStatement({ rightExp: source.funcInv });
        this._transformStmt.addChild(newAssignmentStmt, newAssignIndex, true);
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${source.funcInv.getFunctionName()} to ${target.funcInv.getFunctionName()}`,
            data: {},
        });
    }

    /**
     * Remove operator to operator mapping.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeOperatorToOperatorMapping(source, target) {
        const assignmentStmt = this.getParentAssignmentStmt(target.operator);
        const newAssignIndex = this._transformStmt.getIndexOfChild(assignmentStmt);

        if ((source.index === 1) || ASTFactory.isUnaryExpression(target.operator)) {
            target.operator.setRightExpression(
                ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }),
                { doSilently: true });
        } else {
            target.operator.setLeftExpression(
                ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }),
                { doSilently: true });
        }

        const newAssignmentStmt = DefaultASTFactory
            .createTransformAssignmentRightExpStatement({ rightExp: source.operator });
        this._transformStmt.addChild(newAssignmentStmt, newAssignIndex, true);

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${source.operator.getOperator()} to ${target.operator.getOperator()}`,
            data: {},
        });
    }

    /**
     * remove function to operator mapping.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeFunctionToOperatorMapping(source, target) {
        // Connection source and target are not structs
        // Source and target could be function nodes.
        const assignmentStmt = this.getParentAssignmentStmt(target.operator);
        const newAssignIndex = this._transformStmt.getIndexOfChild(assignmentStmt);

        if ((source.index === 1) || ASTFactory.isUnaryExpression(target.operator)) {
            target.operator.setRightExpression(
                ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }),
                { doSilently: true });
        } else {
            target.operator.setLeftExpression(
                ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }),
                { doSilently: true });
        }

        const newAssignmentStmt = DefaultASTFactory
            .createTransformAssignmentRightExpStatement({ rightExp: source.funcInv });
        this._transformStmt.addChild(newAssignmentStmt, newAssignIndex, true);

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${source.funcInv.getFunctionName()} to ${target.operator.getOperator()}`,
            data: {},
        });
    }

    /**
     * Remove operator to function mapping.
     * @param {any} source source
     * @param {any} target target
     * @memberof TransformNodeMapper
     */
    removeOperatorToFunctionMapping(source, target) {
        const assignmentStmt = this.getParentAssignmentStmt(target.funcInv);
        const newAssignIndex = this._transformStmt.getIndexOfChild(assignmentStmt);

        const index = target.funcInv.getIndexOfChild(source.operator);
        target.funcInv.replaceChild(source.operator, ASTFactory.createNullLiteralExpression(), index, true);

        const newAssignmentStmt = DefaultASTFactory
            .createTransformAssignmentRightExpStatement({ rightExp: source.operator });
        this._transformStmt.addChild(newAssignmentStmt, newAssignIndex, true);

        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-connection-removed',
            title: `Remove mapping ${source.operator.getOperator()} to ${target.funcInv.getFunctionName()}`,
            data: {},
        });
    }

    /**
     * Remove source types
     * @param {any} type type
     * @memberof TransformNodeMapper
     */
    removeSourceType(type) {
        this._transformStmt.removeInput(type);
        this._transformStmt
            .filterChildren(ASTFactory.isAssignmentStatement || ASTFactory.isVariableDefinitionStatement)
            .forEach((stmt) => {
                this.removeInputExpressions(stmt, type.name);
            });
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-source-removed',
            title: `Remove source ${type.name}`,
            data: {},
        });
    }

    /**
     * Remove input expressions from a statement
     * @param {any} stmt statement
     * @param {any} expStr input expression string
     * @memberof TransformNodeMapper
     */
    removeInputExpressions(stmt, expStr) {
        const rightExpression = stmt.getRightExpression();
        if (ASTFactory.isSimpleVariableReferenceExpression(rightExpression)
            && (rightExpression.getExpressionString().trim() === expStr)) {
            this._transformStmt.removeChild(stmt, true);
        } else {
            this.removeInputNestedExpressions(rightExpression, expStr);
        }
    }

    /**
     * Remove input nested expressions in statements of the given expression
     * @param {any} expression expression
     * @param {any} expStr input expression string
     * @memberof TransformNodeMapper
     */
    removeInputNestedExpressions(expression, expStr) {
        if (ASTFactory.isFunctionInvocationExpression(expression)) {
            expression.getChildren().forEach((child, index) => {
                if (child.getExpressionString().trim() === expStr) {
                    expression.replaceChildByIndex(ASTFactory.createNullLiteralExpression(), index);
                } else {
                    this.removeInputNestedExpressions(child, expStr);
                }
            });
        } else if (ASTFactory.isUnaryExpression(expression)) {
            if (expression.getRightExpression().getExpressionString().trim() === expStr) {
                expression.setRightExpression(
                    ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }));
            } else {
                this.removeInputNestedExpressions(expression.getRightExpression(), expStr);
            }
        } else if (ASTFactory.isBinaryExpression(expression)) {
            if (expression.getRightExpression().getExpressionString().trim() === expStr) {
                expression.setRightExpression(
                    ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }));
            } else {
                this.removeInputNestedExpressions(expression.getRightExpression(), expStr);
            }
            if (expression.getLeftExpression().getExpressionString().trim() === expStr) {
                expression.setLeftExpression(
                    ASTFactory.createBasicLiteralExpression({ basicLiteralType: 'int', basicLiteralValue: 0 }));
            } else {
                this.removeInputNestedExpressions(expression.getLeftExpression(), expStr);
            }
        }
    }

    /**
     * Remove target types
     * @param {any} type type
     * @memberof TransformNodeMapper
     */
    removeTargetType(type) {
        this._transformStmt.removeOutput(type);
        this._transformStmt
            .filterChildren(ASTFactory.isAssignmentStatement || ASTFactory.isVariableDefinitionStatement)
            .forEach((stmt) => {
                this.removeOutputExpressions(stmt, type.name);
            });
        this._transformStmt.trigger('tree-modified', {
            origin: this._transformStmt,
            type: 'transform-target-removed',
            title: `Remove target ${type.name}`,
            data: {},
        });
    }

    /**
     * Remove output expressions from a statement
     * @param {any} stmt statement
     * @param {any} expStr output expression string
     * @memberof TransformNodeMapper
     */
    removeOutputExpressions(stmt, expStr) {
        stmt.getLeftExpression().getChildren().forEach((exp, index) => {
            if (exp.getExpressionString().trim() === expStr) {
                if (ASTFactory.isSimpleVariableReferenceExpression(stmt.getRightExpression())) {
                    this._transformStmt.removeChild(stmt, true);
                    // check for temp expressions
                    if (this.isTempVariable(stmt.getRightExpression())) {
                        const tempExp = stmt.getRightExpression();
                        const tempUsedStmts = this.getInputStatements(tempExp);
                        if (tempUsedStmts.length === 1) {
                            const tempAssignStmt = this.getOutputStatement(tempExp);
                            const tempLeftExp = tempAssignStmt.getLeftExpression().getChildren().find((ex) => {
                                return ex.getExpressionString().trim() === tempExp.getExpressionString().trim();
                            });
                            tempAssignStmt.getLeftExpression()
                                .replaceChild(tempLeftExp, tempUsedStmts[0].getLeftExpression().getChildren()[0], true);
                            tempAssignStmt.setIsDeclaredWithVar(false);
                            this._transformStmt.removeChild(tempUsedStmts[0], true);
                        }
                    }
                } else {
                    stmt.getLeftExpression().removeChild(exp, true);
                    stmt.setIsDeclaredWithVar(true);
                    const simpleVarRefExpression = ASTFactory.createSimpleVariableReferenceExpression();
                    simpleVarRefExpression.setExpressionFromString('__output' + (index + 1));
                    stmt.getLeftExpression().replaceChildByIndex(simpleVarRefExpression, index + 1, true);
                }
            }
        });
    }

    // **** UTILITY FUNCTIONS ***** //

    /**
     * Get assignment statement containing the given right expression
     * @param {Expression} expression right expression
     * @return {Statement} statement enclosing the given expression
     * @memberof TransformNodeMapper
     */
    findEnclosingAssignmentStatement(expression) {
        return this._transformStmt.getChildren().find((stmt) => {
            return (this.getMappableExpression(stmt.getRightExpression()).getExpressionString().trim()
                        === expression.getExpressionString().trim());
        });
    }

    /**
    * Gets the enclosing assignment statement.
    * @param {ASTNode} expression
    * @returns {AssignmentStatement} enclosing assignment statement
    * @memberof TransformStatementDecorator
    */
    getParentAssignmentStmt(node) {
        if (ASTFactory.isAssignmentStatement(node) || ASTFactory.isVariableDefinitionStatement(node)) {
            return node;
        } else {
            return this.getParentAssignmentStmt(node.getParent());
        }
    }

    /**
     * The expression that can be used for mapping. E.g. : type cast expressions cannot be mapped
     * directly, but when the cast expression is removed they can be mapped. Similarly, when
     * temporary variables are used, their real mapping expression is the underlying expression
     * that is wrapped by the temporary variable
     * @param {Expression} expression
     * @param {AssignmentStatement} assignmentStmt assignment statement
     * @return {Expression} mapping expression
     * @memberof TransformNodeMapper
     */
    getMappableExpression(expression) {
        if (TreeUtil.isTypeCastExpr(expression) || TreeUtil.isTypeConversionExpr(expression)) {
            return expression.getExpression();
        }
        return expression;
    }

    /**
     * Check other target mappings to create a valid statement
     * @param {Expression} targetExpression target expression
     * @memberof TransformNodeMapper
     */
    validateTargetMappings(targetExpression) {
        const targetStmt = this.getOutputStatement(targetExpression);
        if (targetStmt) {
            if (this.isComplexStatement(targetStmt)) {
                this.removeOutputMapping(targetStmt, targetExpression);
            } else {
                this._transformStmt.removeChild(targetStmt, true);
            }
        }
    }

    /**
     * Get expressions that are mapped by the assignment statement.
     * The output mappings ignore error expressions and placeholder temporary variables.
     * @param {AssignmentStatement} assignmentStmt assignment statement
     * @returns {[Expression]} expressions that are output mappings
     * @memberof TransformNodeMapper
     */
    getOutputExpressions(assignmentStmt) {
        const outputMappings = [];
        assignmentStmt.getLeftExpression().getChildren().forEach((exp, index) => {
            outputMappings[index] = { expression: exp };
            if (this.isInTransformInputOutput(exp)) {
                outputMappings[index].type = ExpressionType.DIRECT;
            } else if (this.isErrorExpression(exp)) {
                outputMappings[index].type = ExpressionType.ERROR;
            } else if (this.isPlaceHolderTempVariable(exp)) {
                outputMappings[index].type = ExpressionType.PLACEHOLDER;
            } else if (this.isConstant(exp, assignmentStmt)) {
                outputMappings[index].type = ExpressionType.CONST;
            } else {
                outputMappings[index].type = ExpressionType.TEMPVAR;
            }
        });
        return outputMappings;
    }

    /**
     * Get the expression assigned by the temporary variable
     * @param {Expression} expression temporary variable
     * @returns {Expression} assigned expression
     * @memberof TransformNodeMapper
     */
    getTempResolvedExpression(expression) {
        const assignmentStmt = this.getOutputStatement(expression);
        return assignmentStmt.getRightExpression();
    }

    /**
     * Get the temporary variable that is assigned by the statement
     * @param {any} statement statement
     * @returns {Expression} temporary variable
     * @memberof TransformNodeMapper
     */
    getAssignedTempVariable(statement) {
        const outExpressions = this.getOutputExpressions(statement);
        return outExpressions.filter((out) => {
            return (out.type === ExpressionType.TEMPVAR);
        });
    }

    /**
     * Check whether the given expression is a temporary variable in the transform
     * statement scope. A temporary variable is a variable that is declared in the
     * transform statement scope and holds a combination of source expressions.
     * E.g.:
     *  1) var __temp1, _ = <int> a;
     *  2) var __temp1 = func(a);
     *  3) var __temp1 = a + b
     *      where a and b are source variables of the transform statement.
     * Mappings of the temp variables can be done in any manner.
     * E.g.:
     *    var __temp1 = func(x);
     *    y = __temp1;
     *    x = __temp1;
     * Here although the mapping is done via a temporary variable, there is an actual
     * value associated, which can be shown as a mapping.
     * @param {Expression} expression expression to check
     * @return {boolean} whether temporary or not
     * @memberof TransformNodeMapper
     */
    isTempVariable(expression, assignmentStmt) {
        if (this.isInTransformInputOutput(expression)
            || this.isErrorExpression(expression)
            || this.isPlaceHolderTempVariable(expression)
            || this.isConstant(expression, assignmentStmt)) {
            return false;
        }
        return true;
    }

    /**
     * Check whether the given expression is a placeholder temporary variable in the transform
     * statement scope.
     * E.g. : var __output1 = func(null);
     * Here the __output1 is not declared earlier, but is a temporary variable, which
     * cannot be shown as a mapping.
     * @param {Expression} expression expression to check
     * @returns {boolean} whether a placeholder temporary variable or not
     * @memberof TransformNodeMapper
     */
    isPlaceHolderTempVariable(expression) {
        if (this.isInTransformInputOutput(expression)) {
            return false;
        }
        const usedStatements = this.getInputStatements(expression);
        return (usedStatements.length === 0);
    }

    /**
     * Check whether the given expression is an input or output expression
     * of transform statement
     * @param {Expression} expression expression to check
     * @returns {boolean} whether or not the expression is an input or an output
     * @memberof TransformNodeMapper
     */
    isInTransformInputOutput(expression) {
        const inputOutput = [...this._transformStmt.inputs, ...this._transformStmt.outputs];
        const ioReference = inputOutput.find((io) => {
            return io === expression.getSource().trim();
        });
        return (ioReference !== undefined);
    }

    /**
    * Checks whether the given expression is an error expression
    * @param {Expression} expression expression
    * @returns {boolean} is or not an error expression
    * @memberof TransformNodeMapper
    */
    isErrorExpression(expression) {
        // TODO: enhance for user defined errors
        return (expression.getSource().trim() === '_');
    }

    /**
     * whether the constant expression is a constant value
     * @param {any} expression expression
     * @param {any} assignmentStmt assignment statement
     * @returns whether the expression is a constant
     * @memberof TransformNodeMapper
     */
    isConstant(expression, assignmentStmt) {
        if (!assignmentStmt) {
            assignmentStmt = this.getOutputStatement(expression);
        }
        return ASTFactory.isBasicLiteralExpression(assignmentStmt.getRightExpression());
    }

    /**
     * Get vertices that are used in expression
     * @param {Expression} expression expression to get vertices from
     * @returns {[Expression]} array of expressions that are inputs
     * @memberof TransformNodeMapper
     */
    getVerticesFromExpression(expression) {
        if (TreeUtil.isSimpleVariableRef(expression)) {
            return [expression];
        }
        if (TreeUtil.isFieldBasedAccessExpr(expression)) {
            return [expression];
        }
        if (TreeUtil.isReferenceTypeInitExpression(expression)) {
            log.error('not implemented reference type init expression');
        }
        if (TreeUtil.isTypeCastExpr(expression) || TreeUtil.isTypeConversionExpr(expression)) {
            return [...this.getVerticesFromExpression(expression.getExpression())];
        }
        if (TreeUtil.isInvocation(expression)) {
            return _.flatten(expression.getChildren().map((exp) => {
                return [...this.getVerticesFromExpression(exp)];
            }));
        }
        if (TreeUtil.isBinaryExpr(expression)) {
            return [...this.getVerticesFromExpression(expression.getLeftExpression()),
                ...this.getVerticesFromExpression(expression.getRightExpression())];
        }
        if (TreeUtil.isUnaryExpr(expression)) {
            return this.getVerticesFromExpression(expression.getExpression());
        }
        if (TreeUtil.isTernaryExpr(expression)) {
            log.error('not implemented reference type init expression');
        }
        return [];
    }

    /**
     * Remove output mapping from the assignment statement
     * @param {AssignmentStatement} assignmentStmt assignment statement
     * @param {Expression} leftExpression left expression to be removed
     * @memberof TransformNodeMapper
     */
    removeOutputMapping(assignmentStmt, leftExpression) {
        const leftExp = assignmentStmt.getLeftExpression().getChildren().find((exp) => {
            return exp.getExpressionString().trim() === leftExpression.getExpressionString();
        });
        const outputVar = ASTFactory.createSimpleVariableReferenceExpression();
        outputVar.setExpressionFromString(this.getNewTempVarName(VarPrefix.OUTPUT));
        assignmentStmt.getLeftExpression().replaceChild(leftExp, outputVar, true);
    }


    /**
     * Get statement that have given expression as output.
     * @param {Expression} expression output expression
     * @return {AssignmentStatement} assignment statement with expression as an output
     * @memberof TransformNodeMapper
     */
    getOutputStatement(expression) {
        return this._transformStmt.filterChildren(TreeUtil.isAssignment).find((stmt) => {
            return stmt.getLeftExpression().getChildren().find((exp) => {
                return expression.getSource().trim() === exp.getSource().trim();
            });
        });
    }

    /**
    * Gets the statements where a given expression has been used.
    * Usage denotes that it is a right expression of a statement.
    * @param {Expression} expression expression to check usage
    * @returns {[AssignmentStatement]} assignment statements with usage
    * @memberof TransformNodeMapper
    */
    getInputStatements(expression) {
        return this._transformStmt.getBody().getStatements().filter((stmt) => {
            const matchingInput = this.getVerticesFromExpression(stmt.getExpression()).filter((exp) => {
                return (exp.getSource().trim() === expression.getSource().trim());
            });
            return (matchingInput.length > 0);
        });
    }

    /**
     * Assign the given assignment statement value to a temporary variable
     * @param {any} assignmentStmt the assignment statement to be extracted to a temp variable
     * @returns the temp variable name
     * @memberof TransformNodeMapper
     */
    assignToTempVariable(assignmentStmt) {
        const tempVarName = this.getNewTempVarName();
        const tempVarRefExpr = ASTFactory.createSimpleVariableReferenceExpression();
        tempVarRefExpr.setExpressionFromString(tempVarName);

        const varRefList = ASTFactory.createVariableReferenceList();
        varRefList.addChild(tempVarRefExpr, true);
        let index = this._transformStmt.getIndexOfChild(assignmentStmt);
        index = (index === 0) ? 0 : index - 1;
        this.insertAssignmentStatement(varRefList, assignmentStmt.getRightExpression(), index, true);
        return tempVarName;
    }

    /**
     * Insert an assignment statement with given expressions at the index
     * @param {any} leftExpressions left expression
     * @param {any} rightExpression right expression
     * @param {any} index index to insert
     * @param {boolean} [isVar=true] whether assignment statement must be declared with var
     * @memberof TransformNodeMapper
     */
    insertAssignmentStatement(leftExpressions, rightExpression, index, isVar = true) {
        const assignmentStmt = ASTFactory.createAssignmentStatement();

        assignmentStmt.addChild(leftExpressions, 0);
        assignmentStmt.addChild(rightExpression, 1);
        assignmentStmt.setIsDeclaredWithVar(isVar);
        // TODO: handle type cast and coversion
    //     const errorVarRef = DefaultBallerinaASTFactory.createIgnoreErrorVariableReference();
    //     varRefList.addChild(errorVarRef);
        this._transformStmt.addChild(assignmentStmt, index, true);
    }

    /**
     * Get a new name for temporary variable
     * @param {string} varPrefix prefix for the variable
     * @returns {Expression} temporary var expression
     * @memberof TransformNodeMapper
     */
    getNewTempVarName(varPrefix = VarPrefix.TEMP) {
        const varNameRegex = new RegExp(varPrefix + '[\\d]*');
        const tempVarNames = [];
        this._transformStmt.getChildren().forEach((stmt) => {
            this.getOutputExpressions(stmt).forEach((mapping) => {
                const expStr = mapping.expression.getExpressionString();
                if ((mapping.type === ExpressionType.TEMPVAR) && varNameRegex.test(expStr)) {
                    tempVarNames.push(expStr);
                }
            });
        });

        tempVarNames.sort();
        let index = 1;
        if (tempVarNames.length > 0) {
            index = Number.parseInt(tempVarNames[tempVarNames.length - 1].substring(varPrefix.length), 10) + 1;
        }
        return varPrefix + index;
    }

    /**
     * Create the compatible source expression based on the compatibility
     * @param {Expression} sourceExpression source expression
     * @param {('implicit'|'explicit'|'conversion')} compatibilityType compatibility type
     * @param {string} targetType target type
     * @returns {Expression} compatible source expression
     * @memberof TransformNodeMapper
     */
    getCompatibleSourceExpression(sourceExpression, compatibilityType, targetType) {
        switch (compatibilityType) {
            case 'explicit' : {
                const typeCastExp = ASTFactory.createTypeCastExpression();
                typeCastExp.addChild(sourceExpression);
                typeCastExp.setTargetType(targetType);
                return typeCastExp;
            }
            case 'conversion' : {
                const typeConversionExp = ASTFactory.createTypeConversionExpression();
                typeConversionExp.addChild(sourceExpression);
                typeConversionExp.setTargetType(targetType);
                return typeConversionExp;
            }
            case 'implicit' :
            default :
                return sourceExpression;
        }
    }

    /**
    * Is the assignment statement a complex one or not. A complex statement will have
    * function invocation or an operator as the right expression.
    * @param {AssignmentStatement} assignmentStmt the assignment statement
    * @return {boolean} is complex or not
    * @memberof TransformNodeMapper
    */
    isComplexStatement(assignmentStmt) {
        return (this.isComplexExpression(this.getMappableExpression(assignmentStmt.getRightExpression())));
    }

    /**
     * An expression is complex if it is function invocation or an operator expression.
     * @param {Expression} expression expression
     * @returns {boolean} is complex or not
     * @memberof TransformNodeMapper
     */
    isComplexExpression(expression) {
        if (ASTFactory.isFunctionInvocationExpression(expression)) {
            return true;
        }
        if (ASTFactory.isBinaryExpression(expression)) {
            return true;
        }
        if (ASTFactory.isUnaryExpression(expression)) {
            return true;
        }
        return false;
    }
}

export default TransformNodeMapper;
