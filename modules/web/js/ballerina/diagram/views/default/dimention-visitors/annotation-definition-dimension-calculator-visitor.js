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
import * as DesignerDefaults from '../designer-defaults';
import { util } from '../sizing-util';
import BallerinaASTFactory from './../../../../ast/ast-factory';

/**
 * Dimension visitor class for Annotation definition.
 *
 * @class AnnotationDefinitionDimensionCalculatorVisitor
 * */
class AnnotationDefinitionDimensionCalculatorVisitor {
    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - Annotation definition node.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    endVisit(node) {
        util.populateOuterPanelDecoratorBBox(node, node.getAnnotationName());
        const viewState = node.getViewState();
        this.annotationAttributeDefinitionDimension(node);
        viewState.bBox.h = viewState.components.heading.h + viewState.components.body.h
            + viewState.components.annotation.h;
    }

    /**
     * Get the max width among children
     *
     * @param {object} node - children node to get the max width.
     * @return {number} maxWidthAmongChildren - Max width among children.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    getMaxWidthOfChildren(node) {
        let maxWidthAmongChildren = 0;
        node.children.forEach((child) => {
            if (BallerinaASTFactory.isAnnotationAttributeDefinition(child)) {
                if (maxWidthAmongChildren < child.viewState.textLength.w) {
                    maxWidthAmongChildren = child.viewState.textLength.w;
                }
            }
        });
        return maxWidthAmongChildren;
    }

    /**
     * Calculate Annotation Attribute Definition Dimension.
     *
     * @param {object} node - annotation definition node.
     *
     * @memberOf AnnotationDefinitionDimensionCalculatorVisitor
     * */
    annotationAttributeDefinitionDimension(node) {
        let bodyHeight = node.viewState.components.body.h;
        let bodyWidth = node.viewState.components.body.w;
        const maxWidthAmongChildren = this.getMaxWidthOfChildren(node);
        node.children.forEach((child) => {
            if (BallerinaASTFactory.isAnnotationAttributeDefinition(child)) {
                bodyHeight += child.viewState.bBox.h
                    + DesignerDefaults.annotationAttributeDefinition.body.padding.bottom;

                if (maxWidthAmongChildren > child.viewState.bBox.w) {
                    child.viewState.bBox.w = maxWidthAmongChildren
                        + DesignerDefaults.annotationAttributeDefinition.body.padding.bottom;
                }

                if (child.viewState.bBox.w > bodyWidth) {
                    bodyWidth = child.viewState.bBox.w;
                }
            }
        });

        if (node.viewState.collapsed) {
            node.viewState.components.body.h = 0;
        } else {
            node.viewState.components.body.h = bodyHeight;
        }
    }
}

export default AnnotationDefinitionDimensionCalculatorVisitor;
