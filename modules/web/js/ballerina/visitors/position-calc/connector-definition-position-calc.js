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
import * as PositioningUtils from './utils';

class ConnectorDefinitionPositionCalcVisitor {

  canVisit(node) {
    return true;
  }

  beginVisit(node) {
    log.debug('begin visit ConnectorDefinitionPositionCalcVisitor');
        // populate outer panel BBox positions.
    PositioningUtils.populateOuterPanelDecoratorBBoxPosition(node);
        // populate panel heading positions.
    PositioningUtils.populatePanelHeadingPositioning(node, this.createPositioningForParameter);
  }

  visit(node) {
    log.debug('visit ConnectorDefinitionPositionCalcVisitor');
  }

  endVisit(node) {
    log.debug('end visit ConnectorDefinitionPositionCalcVisitor');
  }

    /**
     * Sets positioning for a parameter.
     *
     * @param {object} parameter - The parameter node.
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @returns The x position of the next parameter node.
     *
     * @memberof ConnectorDefinitionPositionCalcVisitor
     */
  createPositioningForParameter(parameter, x, y) {
    const viewState = parameter.getViewState();
        // Positioning the parameter
    viewState.bBox.x = x;
    viewState.bBox.y = y;

        // Positioning the delete icon
    viewState.components.deleteIcon.x = x + viewState.w;
    viewState.components.deleteIcon.y = y;

    return viewState.components.deleteIcon.x + viewState.components.deleteIcon.w;
  }
}

export default ConnectorDefinitionPositionCalcVisitor;
