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

import BallerinaASTFactory from './ballerina-ast-factory';
import FragmentUtils from '../utils/fragment-utils';
import _ from 'lodash';

/**
 * @class DefaultBallerinaASTFactory
 * @lends DefaultBallerinaASTFactory
 */
const DefaultBallerinaASTFactory = {};

/**
 * creates ServiceDefinition
 * @param args
 */
DefaultBallerinaASTFactory.createServiceDefinition = function (args) {
  const serviceDef = BallerinaASTFactory.createServiceDefinition(args);
  const resourceDef = DefaultBallerinaASTFactory.createResourceDefinition(args);
  serviceDef.addChild(resourceDef, undefined, undefined, undefined, true);
  return serviceDef;
};

DefaultBallerinaASTFactory.createForkJoinStatement = function (args) {
  const forkJoinStatement = BallerinaASTFactory.createForkJoinStatement(args);
  const joinStatement = BallerinaASTFactory.createJoinStatement();
  const worker1Declaration = BallerinaASTFactory.createWorkerDeclaration();
  const worker2Declaration = BallerinaASTFactory.createWorkerDeclaration();
  worker1Declaration.setWorkerName('forkWorker1');
  worker2Declaration.setWorkerName('forkWorker2');
  forkJoinStatement.addChild(joinStatement);
  forkJoinStatement.addChild(worker1Declaration);
  forkJoinStatement.addChild(worker2Declaration);
  return forkJoinStatement;
};

/**
 * creates ResourceDefinition
 * @param args
 */
DefaultBallerinaASTFactory.createResourceDefinition = function (args) {
  const resourceDef = BallerinaASTFactory.createResourceDefinition(args);

    // Creating GET http method annotation.
  const getHttpMethodAnnotation = BallerinaASTFactory.createAnnotation({
    fullPackageName: 'ballerina.net.http',
    packageName: 'http',
    identifier: 'GET',
    uniqueIdentifier: 'httpMethod',
  });
  resourceDef.addChild(getHttpMethodAnnotation, 0);

  const parameterDef = BallerinaASTFactory.createParameterDefinition(args);
  parameterDef.setTypeName('message');
  parameterDef.setName('m');

  const argumentParameterDefinitionHolder = BallerinaASTFactory.createArgumentParameterDefinitionHolder();
  argumentParameterDefinitionHolder.addChild(parameterDef);
  resourceDef.addChild(argumentParameterDefinitionHolder);

  const responsesAnnotation = BallerinaASTFactory.createAnnotation({
    fullPackageName: 'ballerina.net.http.swagger',
    packageName: 'swagger',
    identifier: 'Responses',
  });

    // Creating the responses array entry
  const responsesAnnotationArray = BallerinaASTFactory.createAnnotationEntryArray();
  const responseAnnotationEntry = BallerinaASTFactory.createAnnotationEntry({ rightValue: responsesAnnotationArray });
  responsesAnnotation.addChild(responseAnnotationEntry);
  return resourceDef;
};

/**
 * creates ConnectorDefinition
 * @param args
 */
DefaultBallerinaASTFactory.createConnectorDefinition = function (args) {
  const connectorDef = BallerinaASTFactory.createConnectorDefinition(args);
  connectorDef.addArgument('message', 'm');
  const connectorActionDef = DefaultBallerinaASTFactory.createConnectorAction();
  connectorDef.addChild(connectorActionDef, undefined, undefined, undefined, true);
  return connectorDef;
};

/**
 * creates ConnectorAction
 * @param args
 */
DefaultBallerinaASTFactory.createConnectorAction = function (args) {
  const actionDef = BallerinaASTFactory.createConnectorAction(args);
  actionDef.addArgument('message', 'm');
  return actionDef;
};

/**
 * Creates a variable definition statement with default values.
 * @param {Object} [args] - Args for creating a variable definition statement.
 * @return {VariableDefinitionStatement} - New variable definition statement.
 *
 * @see {@link VariableDefinitionStatement}
 */
DefaultBallerinaASTFactory.createVariableDefinitionStatement = function (args) {
  const variableDefinitionStatement = BallerinaASTFactory.createVariableDefinitionStatement(args);
  variableDefinitionStatement.setStatementFromString('int i = 0');
  return variableDefinitionStatement;
};

/**
 * Create the action invocation statement for action invocation
 * @param args
 * @returns {ActionInvocationStatement}
 */
DefaultBallerinaASTFactory.createAggregatedActionInvocationStatement = function (args) {
  const actionInStmt = BallerinaASTFactory.createActionInvocationStatement(args);
  const actionInExp = BallerinaASTFactory.createActionInvocationExpression(args);
  actionInStmt.addChild(actionInExp);
  return actionInStmt;
};

/**
 * Create the particular assignment statement for the action invocation
 * @param args
 * @returns {AssignmentStatement}
 */
DefaultBallerinaASTFactory.createAggregatedActionInvocationAssignmentStatement = function (args) {
  const assignmentStatementString = `m = ${args.actionPackageName}:${
        args.actionConnectorName}.${args.action}()`;
  const assignmentStatement = BallerinaASTFactory.createAssignmentStatement();
  assignmentStatement.setStatementFromString(assignmentStatementString);
  return assignmentStatement;
};

/**
 * creates TryCatchStatement
 * @param args
 */
DefaultBallerinaASTFactory.createTryCatchStatement = function (args) {
  const tryCatchStatement = BallerinaASTFactory.createTryCatchStatement(args);
  tryCatchStatement.setStatementFromString('try{}catch(exception e){}');
  return tryCatchStatement;
};

/**
 * creates ThrowStatement
 * @param {Object} args - Arguments for creating a new throw statement.
 * @returns {ThrowStatement}
 */
DefaultBallerinaASTFactory.createThrowStatement = function (args) {
  const throwStatement = BallerinaASTFactory.createThrowStatement(args);
  throwStatement.setStatementFromString('throw e');
  return throwStatement;
};

/**
 * create an abort statement.
 * @param {object} args - arguments for creating a new throw statement.
 * @return {AbortStatement}
 * */
DefaultBallerinaASTFactory.createAbortStatement = function (args) {
  return BallerinaASTFactory.createAbortStatement(args);
};

/**
 * create TransactionAborted Statement.
 * @param {object} args - argument for creating a new TransactionAborted statement.
 * @return {TransactionAbortedStatement}
 * */
DefaultBallerinaASTFactory.createTransactionAbortedStatement = function (args) {
  const transactionAbortedStatement = BallerinaASTFactory.createTransactionAbortedStatement(args);
  transactionAbortedStatement.setStatementFromString('transaction {} aborted {} committed {}');
  return transactionAbortedStatement;
};

/**
 * creates MainFunctionDefinition
 * @param args
 */
DefaultBallerinaASTFactory.createMainFunctionDefinition = function (args) {
  const functionDefinition = BallerinaASTFactory.createFunctionDefinition(args);
  functionDefinition.setFunctionName('main');
  functionDefinition.addArgument('string[]', 'args');
  return functionDefinition;
};

/**
 * creates Aggregated AssignmentStatement
 * @param {Object} args
 * @returns {AssignmentStatement}
 */
DefaultBallerinaASTFactory.createAggregatedAssignmentStatement = function (args) {
  const fragment = FragmentUtils.createStatementFragment('a = b;');
  const parsedJson = FragmentUtils.parseFragment(fragment);
  if ((!_.has(parsedJson, 'error')
           || !_.has(parsedJson, 'syntax_errors'))
           && _.isEqual(parsedJson.type, 'assignment_statement')) {
    const node = BallerinaASTFactory.createFromJson(parsedJson);
    node.initFromJson(parsedJson);
    node.whiteSpace.useDefault = true;
    return node;
  }
  return BallerinaASTFactory.createAssignmentStatement();
};

/**
 * creates FunctionInvocationStatement
 * @param args
 * @returns {FunctionInvocationStatement}
 */
DefaultBallerinaASTFactory.createAggregatedFunctionInvocationStatement = function (args) {
  const funcInvocationStatement = BallerinaASTFactory.createFunctionInvocationStatement();
  const opts = {
    functionName: _.get(args, 'functionDef._name'),
    packageName: _.get(args, 'packageName'),
    fullPackageName: _.get(args, 'fullPackageName'),
  };
  const funcInvocationExpression = BallerinaASTFactory.createFunctionInvocationExpression(opts);
  if (!_.isNil(args) && _.has(args, 'functionDef')) {
    let functionInvokeString = '';
    if (!_.isNil(args.packageName)) {
      functionInvokeString += `${args.packageName}:`;
    }
    functionInvokeString += `${args.functionDef.getName()}(`;
    if (!_.isEmpty(args.functionDef.getParameters())) {
      args.functionDef.getParameters().forEach((param, index) => {
        if (index !== 0) {
          functionInvokeString += ', ';
        }
        functionInvokeString += param.name;
      });
    }
    functionInvokeString += ')';
    funcInvocationExpression.setExpressionFromString(functionInvokeString);

        // fragment parser does not have access to full package name. Hence, setting it here.
    funcInvocationExpression.setFullPackageName(_.get(args, 'fullPackageName'));

    if (!_.isEmpty(args.functionDef.getReturnParams())) {
            // FIXME : Do a better solution to this by refactoring transform addChild and canDrop
      const assignmentStmt = BallerinaASTFactory.createAssignmentStatement();
      const leftOp = BallerinaASTFactory.createLeftOperandExpression(args);
      const rightOp = BallerinaASTFactory.createRightOperandExpression(args);
      rightOp.addChild(funcInvocationExpression);
      assignmentStmt.addChild(leftOp);
      assignmentStmt.addChild(rightOp);
      return assignmentStmt;
    }
  }
  funcInvocationStatement.addChild(funcInvocationExpression);
  return funcInvocationStatement;
};

/**
 * creates WorkerInvocationStatement
 * @param args
 * @returns {WorkerInvocationStatement}
 */
DefaultBallerinaASTFactory.createWorkerInvocationStatement = function (args) {
  const workerInvocationStatement = BallerinaASTFactory.createWorkerInvocationStatement();
  workerInvocationStatement.setStatementFromString('m -> workerName');
  return workerInvocationStatement;
};

/**
 * creates workerReplyStatement
 * @param args
 * @returns WorkerReplyStatement}
 */
DefaultBallerinaASTFactory.createWorkerReplyStatement = function (args) {
  const workerReplyStatement = BallerinaASTFactory.createWorkerReplyStatement();
  workerReplyStatement.setStatementFromString('m <- workerName');
  return workerReplyStatement;
};

export default DefaultBallerinaASTFactory;
