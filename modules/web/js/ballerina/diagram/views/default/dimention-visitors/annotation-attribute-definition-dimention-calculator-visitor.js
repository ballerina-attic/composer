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

/**
 * Dimension visitor for annotation attribute.
 *
 * @class AnnotationAttributeDimensionCalculatorVisitor
 * */
class AnnotationAttributeDimensionCalculatorVisitor {
    /**
     * can visit the visitor.
     *
     * @return {boolean} true.
     *
     * @memberOf AnnotationAttributeDimensionCalculatorVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visit the visitor.
     *
     * @memberOf AnnotationAttributeDimensionCalculatorVisitor
     * */
    beginVisit() {
    }

    /**
     * visit the visitor.
     *
     * @memberOf AnnotationAttributeDimensionCalculatorVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - Annotation Attribute node.
     *
     * @memberOf AnnotationAttributeDimensionCalculatorVisitor
     * */
    endVisit(node) {
        const viewState = node.getViewState();
        const components = {};

        viewState.bBox.h = DesignerDefaults.annotationAttributeDefinition.body.height;
        viewState.bBox.w = DesignerDefaults.annotationAttributeDefinition.body.width;
        // TODO: Remove the text length from annotation related classes.
        viewState.textLength = {
            text: "",
            w: 0,
        };

        viewState.components = components;
    }
}

export default AnnotationAttributeDimensionCalculatorVisitor;
