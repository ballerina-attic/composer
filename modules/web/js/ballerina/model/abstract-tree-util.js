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

class AbstractTreeUtil {


    isAction(node) {
        return node.kind === 'Action';
    }

    isAnnotation(node) {
        return node.kind === 'Annotation';
    }

    isAnnotationAttachment(node) {
        return node.kind === 'AnnotationAttachment';
    }

    isAnnotationAttribute(node) {
        return node.kind === 'AnnotationAttribute';
    }

    isCatch(node) {
        return node.kind === 'Catch';
    }

    isCompilationUnit(node) {
        return node.kind === 'CompilationUnit';
    }

    isConnector(node) {
        return node.kind === 'Connector';
    }

    isEnum(node) {
        return node.kind === 'Enum';
    }

    isFunction(node) {
        return node.kind === 'Function';
    }

    isIdentifier(node) {
        return node.kind === 'Identifier';
    }

    isImport(node) {
        return node.kind === 'Import';
    }

    isPackage(node) {
        return node.kind === 'Package';
    }

    isPackageDeclaration(node) {
        return node.kind === 'PackageDeclaration';
    }

    isRecordLiteralKeyValue(node) {
        return node.kind === 'RecordLiteralKeyValue';
    }

    isResource(node) {
        return node.kind === 'Resource';
    }

    isRetry(node) {
        return node.kind === 'Retry';
    }

    isService(node) {
        return node.kind === 'Service';
    }

    isStruct(node) {
        return node.kind === 'Struct';
    }

    isVariable(node) {
        return node.kind === 'Variable';
    }

    isWorker(node) {
        return node.kind === 'Worker';
    }

    isXmlns(node) {
        return node.kind === 'Xmlns';
    }

    isTransformer(node) {
        return node.kind === 'Transformer';
    }

    isAnnotationAttachmentAttribute(node) {
        return node.kind === 'AnnotationAttachmentAttribute';
    }

    isAnnotationAttachmentAttributeValue(node) {
        return node.kind === 'AnnotationAttachmentAttributeValue';
    }

    isArrayLiteralExpr(node) {
        return node.kind === 'ArrayLiteralExpr';
    }

    isBinaryExpr(node) {
        return node.kind === 'BinaryExpr';
    }

    isConnectorInitExpr(node) {
        return node.kind === 'ConnectorInitExpr';
    }

    isFieldBasedAccessExpr(node) {
        return node.kind === 'FieldBasedAccessExpr';
    }

    isIndexBasedAccessExpr(node) {
        return node.kind === 'IndexBasedAccessExpr';
    }

    isInvocation(node) {
        return node.kind === 'Invocation';
    }

    isLambda(node) {
        return node.kind === 'Lambda';
    }

    isLiteral(node) {
        return node.kind === 'Literal';
    }

    isRecordLiteralExpr(node) {
        return node.kind === 'RecordLiteralExpr';
    }

    isSimpleVariableRef(node) {
        return node.kind === 'SimpleVariableRef';
    }

    isStringTemplateLiteral(node) {
        return node.kind === 'StringTemplateLiteral';
    }

    isTernaryExpr(node) {
        return node.kind === 'TernaryExpr';
    }

    isTypeCastExpr(node) {
        return node.kind === 'TypeCastExpr';
    }

    isTypeConversionExpr(node) {
        return node.kind === 'TypeConversionExpr';
    }

    isUnaryExpr(node) {
        return node.kind === 'UnaryExpr';
    }

    isXmlQname(node) {
        return node.kind === 'XmlQname';
    }

    isXmlAttribute(node) {
        return node.kind === 'XmlAttribute';
    }

    isXmlQuotedString(node) {
        return node.kind === 'XmlQuotedString';
    }

    isXmlElementLiteral(node) {
        return node.kind === 'XmlElementLiteral';
    }

    isXmlTextLiteral(node) {
        return node.kind === 'XmlTextLiteral';
    }

    isXmlCommentLiteral(node) {
        return node.kind === 'XmlCommentLiteral';
    }

    isXmlPiLiteral(node) {
        return node.kind === 'XmlPiLiteral';
    }

    isAbort(node) {
        return node.kind === 'Abort';
    }

    isAssignment(node) {
        return node.kind === 'Assignment';
    }

    isBind(node) {
        return node.kind === 'Bind';
    }

    isBlock(node) {
        return node.kind === 'Block';
    }

    isBreak(node) {
        return node.kind === 'Break';
    }

    isNext(node) {
        return node.kind === 'Next';
    }

    isExpressionStatement(node) {
        return node.kind === 'ExpressionStatement';
    }

    isForkJoin(node) {
        return node.kind === 'ForkJoin';
    }

    isIf(node) {
        return node.kind === 'If';
    }

    isReply(node) {
        return node.kind === 'Reply';
    }

    isReturn(node) {
        return node.kind === 'Return';
    }

    isComment(node) {
        return node.kind === 'Comment';
    }

    isThrow(node) {
        return node.kind === 'Throw';
    }

    isTransaction(node) {
        return node.kind === 'Transaction';
    }

    isTransform(node) {
        return node.kind === 'Transform';
    }

    isTry(node) {
        return node.kind === 'Try';
    }

    isVariableDef(node) {
        return node.kind === 'VariableDef';
    }

    isWhile(node) {
        return node.kind === 'While';
    }

    isWorkerReceive(node) {
        return node.kind === 'WorkerReceive';
    }

    isWorkerSend(node) {
        return node.kind === 'WorkerSend';
    }

    isArrayType(node) {
        return node.kind === 'ArrayType';
    }

    isBuiltInRefType(node) {
        return node.kind === 'BuiltInRefType';
    }

    isConstrainedType(node) {
        return node.kind === 'ConstrainedType';
    }

    isFunctionType(node) {
        return node.kind === 'FunctionType';
    }

    isUserDefinedType(node) {
        return node.kind === 'UserDefinedType';
    }

    isEndpointType(node) {
        return node.kind === 'EndpointType';
    }

    isValueType(node) {
        return node.kind === 'ValueType';
    }


}

export default AbstractTreeUtil;
