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

import log from 'log';
import * as DesignerDefaults from './../../configs/designer-defaults';
import SimpleBBox from './../../ast/simple-bounding-box';
import {util} from './../sizing-utils';

class AnnotationDefinitionDimensionCalculatorVisitor {
    canVisit(node) {
        log.debug("can visit AnnotationDefinitionDimensionCalc");
        return true;
    }

    beginVisit(node) {
        log.debug("beign visit AnnotationDefinitionDimensionCalc");
    }

    visit(node) {
        log.debug("visit AnnotationDefinitionDimensionCalc");
    }

    endVisit(node) {
        let viewState = node.getViewState();
        let components = {};

        components['heading'] = new SimpleBBox();

        //Initial statement height include panel heading and pannel padding.
        let bodyHeight = DesignerDefaults.panel.body.padding.top + DesignerDefaults.panel.body.padding.bottom;
        // Set the width to 0 don't add the padding now since we do a comparison.
        let bodyWidth = 0;
        let largestWidthAmongChildren = 0;

        // Get the largest width of children.
        node.children.forEach(function (child, index) {
            if (largestWidthAmongChildren < child.viewState.textLength.w) {
                largestWidthAmongChildren = child.viewState.textLength.w;
            }
        });

        node.children.forEach(function (child, index) {
            bodyHeight += child.viewState.bBox.h;
            // If there is only one child no need to add gutter
            if (index === 1) {
                bodyHeight = bodyHeight + DesignerDefaults.innerPanel.wrapper.gutter.v;
            }

            if (largestWidthAmongChildren > child.viewState.bBox.w) {
                child.viewState.bBox.w = largestWidthAmongChildren + 10;
            }

            if (child.viewState.bBox.w > bodyWidth) {
                bodyWidth = child.viewState.bBox.w;
            }
        });

        bodyWidth = bodyWidth + DesignerDefaults.panel.body.padding.left + DesignerDefaults.panel.body.padding.right;

        components['body'] = new SimpleBBox();

        if (node.viewState.collapsed) {
            components['body'].h = 0;
        } else {
            components['body'].h = bodyHeight;
        }
        components['body'].w = bodyWidth;
        components['heading'].w = bodyWidth;

        viewState.bBox.h = components['heading'].h + components['body'].h;

        viewState.components = components;

        const textWidth = util.getTextWidth(node.getAnnotationName());
        viewState.titleWidth = textWidth.w;
        viewState.trimmedTitle = textWidth.text;

        //// Creating components for parameters of the annotation
        // Creating component for opening bracket of the parameters view.
        viewState.components.openingParameter = {};
        viewState.components.openingParameter.w = util.getTextWidth('(', 0).w;

        // Creating component for closing bracket of the parameters view.
        viewState.components.closingParameter = {};
        viewState.components.closingParameter.w = util.getTextWidth(')', 0).w;

        let componentWidth = components['heading'].w > components['body'].w
            ? components['heading'].w : components['body'].w;

        viewState.bBox.w = componentWidth +
            this.annotationAttachmentPointWidth(node) +
            viewState.titleWidth + 14 + (DesignerDefaults.panel.wrapper.gutter.h * 2) + 100;
    }

    /**
     * Calculate Attachment point text width for annotation attachments.
     * @param {AnnotationDefinition} node - Annotation Definition Node.
     * @return {number} width - return sum of the widths of attachment texts.
     * */
    annotationAttachmentPointWidth(node) {
        let width = 0;
        if (node.getAttachmentPoints().length > 0) {
            for (let i = 0; i < node.getAttachmentPoints().length; i++) {
                width += util.getTextWidth(node.getAttachmentPoints()[i], 0).w;
            }
        }

        return width;
    }
}

export default AnnotationDefinitionDimensionCalculatorVisitor;
