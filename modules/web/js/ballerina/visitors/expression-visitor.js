/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import ASTVisitor from './ast-visitor';
import ASTFactory from './../ast/ballerina-ast-factory';

class ExpressionVisitor extends ASTVisitor {
  constructor(args) {
    super(args);
  }

  canVisitLeftOperandExpression(expression) {
    return false;
  }

  beginVisitLeftOperandExpression(expression) {
  }

  visitLeftOperandExpression(expression) {
  }

  endVisitLeftOperandExpression(expression) {
  }

  canVisitRightOperandExpression(expression) {
    return false;
  }

  beginVisitRightOperandExpression(expression) {
  }

  visitRightOperandExpression(expression) {
  }

  endVisitRightOperandExpression(expression) {
  }

  canVisitVariableReferenceExpression(expression) {
    return false;
  }

  beginVisitVariableReferenceExpression(expression) {
  }

  visitVariableReferenceExpression(expression) {
  }

  endVisitVariableReferenceExpression(expression) {
  }

  canVisitTypeCastExpression(expression) {
    return false;
  }

  beginVisitTypeCastExpression(expression) {
  }

  visitTypeCastExpression(expression) {
  }

  endVisitTypeCastExpression(expression) {
  }

  canVisitTypeConversionExpression(expression) {
    return false;
  }

  beginVisitTypeConversionExpression(expression) {
  }

  visitTypeConversionExpression(expression) {
  }

  endVisitTypeConversionExpression(expression) {
  }

    /**
     * @param node {ASTNode}
     */
  visitExpression(node) {
    if (ASTFactory.isVariableReferenceExpression(node)) {
      return this.visitVariableReferenceExpression(node);
    } else if (ASTFactory.isTypeCastExpression(node)) {
      return this.visitTypeCastExpression(node);
    } else if (ASTFactory.isTypeConversionExpression(node)) {
      return this.visitTypeConversionExpression(node);
    } else if (ASTFactory.isLeftOperandExpression(node)) {
      return this.visitLeftOperandExpression(node);
    } else if (ASTFactory.isRightOperandExpression(node)) {
      return this.visitRightOperandExpression(node);
    }
  }

    /**
     * @param node {ASTNode}
     */
  canVisitExpression(node) {
    if (ASTFactory.isVariableReferenceExpression(node)) {
      return this.canVisitVariableReferenceExpression(node);
    } else if (ASTFactory.isTypeCastExpression(node)) {
      return this.canVisitTypeCastExpression(node);
    } else if (ASTFactory.isTypeConversionExpression(node)) {
      return this.canVisitTypeConversionExpression(node);
    } else if (ASTFactory.isLeftOperandExpression(node)) {
      return this.canVisitLeftOperandExpression(node);
    } else if (ASTFactory.isRightOperandExpression(node)) {
      return this.canVisitRightOperandExpression(node);
    }
  }

    /**
     * @param node {ASTNode}
     */
  beginVisitExpression(node) {
    if (ASTFactory.isVariableReferenceExpression(node)) {
      this.beginVisitVariableReferenceExpression(node);
    } else if (ASTFactory.isTypeCastExpression(node)) {
      this.beginVisitTypeCastExpression(node);
    } else if (ASTFactory.isTypeConversionExpression(node)) {
      this.beginVisitTypeConversionExpression(node);
    } else if (ASTFactory.isLeftOperandExpression(node)) {
      return this.beginVisitLeftOperandExpression(node);
    } else if (ASTFactory.isRightOperandExpression(node)) {
      return this.beginVisitRightOperandExpression(node);
    }
  }

    /**
     * @param node {ASTNode}
     */
  endVisitExpression(node) {
    if (ASTFactory.isVariableReferenceExpression(node)) {
      return this.endVisitVariableReferenceExpression(node);
    } else if (ASTFactory.isTypeCastExpression(node)) {
      return this.endVisitTypeCastExpression(node);
    } else if (ASTFactory.isTypeConversionExpression(node)) {
      return this.endVisitTypeConversionExpression(node);
    } else if (ASTFactory.isLeftOperandExpression(node)) {
      return this.endVisitLeftOperandExpression(node);
    } else if (ASTFactory.isRightOperandExpression(node)) {
      return this.endVisitRightOperandExpression(node);
    }
  }
}

export default ExpressionVisitor;
