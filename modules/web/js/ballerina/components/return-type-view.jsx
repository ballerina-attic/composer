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
import PropTypes from 'prop-types';
import ImageUtil from './image-util';

class ReturnTypeView extends React.Component {

  onDelete() {
    this.props.model.remove();
  }

  render() {
    const model = this.props.model;
    const viewState = model.viewState;
    const returnTypeAsString = model.getParameterDefinitionAsString();
    return (<g><rect x={viewState.x} y={viewState.y + 3} width={viewState.w} height={viewState.h} rx="0" ry="0" className="return-type-wrapper" />
      <text x={viewState.x + 5} y={viewState.y + 3} className="return-type-text">{returnTypeAsString}</text>
      <rect x={viewState.components.deleteIcon.x} y={viewState.components.deleteIcon.y + 3} width={viewState.components.deleteIcon.w} height={viewState.components.deleteIcon.h} rx="0" ry="0" className="return-type-delete-icon-wrapper" />
      <image
        x={viewState.components.deleteIcon.x + 2} y={viewState.components.deleteIcon.y + 5} width="14" height="14" className="return-type-delete-icon"
        xlinkHref={ImageUtil.getSVGIconString('delete')} onClick={() => this.onDelete()}
      />
    </g>);
  }
}

ReturnTypeView.propTypes = {
};


export default ReturnTypeView;
