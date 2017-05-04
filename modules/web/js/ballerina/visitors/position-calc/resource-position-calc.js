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
import _ from 'lodash';
import * as DesignerDefaults from './../../configs/designer-defaults';
import AST from './../../ast/module';
import ASTFactory from './../../ast/ballerina-ast-factory';
import { util } from './../sizing-utils';

class ResourceDefinitionPositionCalcVisitor {

    canVisit(node) {
        log.debug('can visit ResourceDefinitionPositionCalc');
        return true;
    }

    beginVisit(node) {
        let parent = node.getParent();
        let viewSate = node.getViewState();
        let parentViewState = parent.getViewState();
        var parentBBox = parentViewState.bBox;
        let bBox = viewSate.bBox;
        let statementContainerBBox = viewSate.components.statementContainer;
        let headerBBox = viewSate.components.heading;
        let bodyBBox = viewSate.components.body;
        let resources = _.filter(parent.getChildren(), function (child) {
            return child instanceof AST.ResourceDefinition;
        });
        let x, y, headerX, headerY, bodyX, bodyY;
        var currentResourceIndex = _.findIndex(resources, node);

        headerX = parentBBox.x + DesignerDefaults.panel.body.padding.left;

        if (currentResourceIndex === 0) {
            /**
             * If there are service level connectors, then we need to drop the first resource further down,
             * in order to maintain a gap between the connector heading and the resource heading
             */
            const parentLevelConnectors = node.getParent().filterChildren(function (child) {
                return ASTFactory.isConnectorDeclaration(child);
            });
            if (parentLevelConnectors.length > 0) {
                headerY = parentViewState.components.body.y + DesignerDefaults.panel.body.padding.top +
                    DesignerDefaults.lifeLine.head.height + DesignerDefaults.panel.wrapper.gutter.v;
            } else {
                headerY = parentViewState.components.body.y + DesignerDefaults.panel.body.padding.top;
            }
        } else if (currentResourceIndex > 0) {
            let previousResourceBBox = resources[currentResourceIndex - 1].getViewState().bBox;
            headerY = previousResourceBBox.y + previousResourceBBox.h + DesignerDefaults.panel.wrapper.gutter.v;
        } else {
            throw 'Invalid Index for Resource Definition';
        }

        x = headerX;
        y = headerY;
        bodyX = headerX;
        bodyY = headerY + headerBBox.h;

        statementContainerBBox.x = bodyX + DesignerDefaults.innerPanel.body.padding.left;
        statementContainerBBox.y = bodyY + DesignerDefaults.innerPanel.body.padding.top +
            DesignerDefaults.lifeLine.head.height;

        bBox.x = x;
        bBox.y = y;
        headerBBox.x = headerX;
        headerBBox.y = headerY;
        bodyBBox.x = bodyX;
        bodyBBox.y = bodyY;

        // Setting positions of resource parameters.
        if (node.getParameters().length > 0) {
            node.getViewState().components['parametersPrefixContainer'].x = node.getViewState().bBox.x + viewSate.titleWidth;
            let nextXPositionOfParameter = node.getViewState().components['parametersPrefixContainer'].x + 
                    node.getViewState().components['parametersPrefixContainer'].w;
            for (let i = 0; i < node.getParameters().length; i++) {
                let resourceParameter = node.getParameters()[i];
                let viewState = resourceParameter.getViewState();
                if (i !== 0) {
                    nextXPositionOfParameter = nextXPositionOfParameter + 14;
                }

                viewState.x = nextXPositionOfParameter;
                nextXPositionOfParameter += util.getTextWidth(resourceParameter.getParameterAsString()).w;
            }
        }
    }

    visit(node) {
    }

    endVisit(node) {
    }
}

export default ResourceDefinitionPositionCalcVisitor;
