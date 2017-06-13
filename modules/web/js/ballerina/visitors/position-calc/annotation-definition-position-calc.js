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
import { util } from './../sizing-utils';
import * as PositioningUtils from './utils';

class AnnotationDefinitionPositionCalcVisitor {
    /**
     * Check whether annotation definition position calc visitor can be visited.
     * @param {object} node.
     * @return {boolean}
     * */
  canVisit(node) {
    log.debug('can visit AnnotationPositionCalc');
    return true;
  }

  beginVisit(node) {
    log.debug('begin visit AnnotationPositionCalc');

        // populate outer panel BBox position.
    PositioningUtils.populateOuterPanelDecoratorBBoxPosition(node);

        // populate panel heading positioning.
    PositioningUtils.populatePanelHeadingPositioning(node, this.createPositionForTitleNode);
  }

  visit(node) {
    log.debug('visit AnnotationPositionCalc');
  }

  endVisit(node) {
    log.debug('end visit AnnotationPositionCalc');
  }

    /**
     * Sets positioning for a annotation attachment.
     *
     * @param {object} attachment - attachment point value.
     * @param {number} x  - The x position
     * @param {number} y  - The y position
     * @returns The x position of the next parameter node.
     *
     * @memberof AnnotationDefinitionPositionCalc
     */
  createPositionForTitleNode(attachment, x, y) {
    const viewState = attachment.model.getViewState();

    const childViewState = {
      viewState: {
        bBox: {
          x,
          y,
          w: util.getTextWidth(attachment.attachment, 0).w,
          h: DesignerDefaults.panelHeading.heading.height - 7,
        },
        components: {
          deleteIcon: {
            x: x + util.getTextWidth(attachment.attachment, 0).w,
            y,
            w: DesignerDefaults.panelHeading.heading.height - 7,
            h: DesignerDefaults.panelHeading.heading.height - 7,
          },
        },
        w: util.getTextWidth(attachment.attachment, 0).w,
        h: DesignerDefaults.panelHeading.heading.height - 7,
      },
    };
    viewState.attachments[attachment.attachment] = childViewState;

    return (x + util.getTextWidth(attachment.attachment, 0).w)
            + childViewState.viewState.components.deleteIcon.w;
  }
}

export default AnnotationDefinitionPositionCalcVisitor;
