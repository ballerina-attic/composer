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

import React from 'react';
import './import-declaration.css';
import ImageUtil from './image-util';
import { util as SizingUtils } from '../visitors/sizing-utils';

export default class importDeclaration extends React.Component {

  render() {
    const bBox = this.props.bBox;
    const headerHeight = 35;
    const leftPadding = 10;
    const iconSize = 20;
    const importNoFontSize = 13;
    const noOfImportsLeftPadding = 12;
    const iconLeftPadding = 12;
    const noOfImportsBGHeight = 18;
    const importLabelWidth = 48.37;

    const noOfImports = this.props.imports.length;

    const noOfImportsTextWidth = SizingUtils.getOnlyTextWidth(noOfImports, { fontSize: importNoFontSize });
    const noOfImportsBGWidth = Math.max(noOfImportsTextWidth + 6, noOfImportsBGHeight);

    const badgeWidth = leftPadding + importLabelWidth + noOfImportsLeftPadding + noOfImportsTextWidth +
                           iconLeftPadding + iconSize + leftPadding;

    const labelBbox = {
      x: bBox.x + leftPadding,
      y: bBox.y + headerHeight / 2,
    };

    const numberBbox = {
      x: labelBbox.x + importLabelWidth + noOfImportsLeftPadding,
      y: labelBbox.y,
    };

    const iconBbox = {
      x: numberBbox.x + noOfImportsTextWidth + iconLeftPadding,
      y: numberBbox.y - iconSize / 2,
    };

    return (
      <g className="package-definition-head" onClick={(e) => { this.props.onClick(e); }}>
        <rect x={bBox.x} y={bBox.y} width={badgeWidth} height={headerHeight} rx="0" ry="0" className="package-definition-header" />
        <rect x={bBox.x} y={bBox.y} height={headerHeight} className="import-definition-decorator" />
        <text x={labelBbox.x} y={labelBbox.y} rx="0" ry="0">
                    Imports
                </text>
        <rect
          x={numberBbox.x - (noOfImportsBGWidth - noOfImportsTextWidth) / 2} y={numberBbox.y - noOfImportsBGHeight / 2} width={noOfImportsBGWidth} height={noOfImportsBGHeight}
          rx={noOfImportsBGHeight / 2} ry={noOfImportsBGHeight / 2} className="import-badge"
        />
        <text x={numberBbox.x} y={numberBbox.y} rx="0" ry="0" style={{ fontSize: importNoFontSize }} className="import-badge-text">
          {noOfImports}
        </text>
        <image
          width={iconSize} height={iconSize} className="property-pane-action-button-delete"
          xlinkHref={ImageUtil.getSVGIconString('view')} x={iconBbox.x} y={iconBbox.y}
        />
      </g>
    );
  }
}
