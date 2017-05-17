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
import ImageUtil from './image-util';

class ParameterDefinition extends React.Component {
    constructor() {
        super();
    }

    onDelete() {
        this.props.model.remove();
    }

    render() {
        let model = this.props.model;
        let viewState = model.viewState;
        return (<g>
            <rect x={viewState.bBox.x + 7} y={viewState.bBox.y } width={viewState.w + 5} height={viewState.h} rx="0" ry="0"
                  className="parameter-wrapper"/>
            <text x={viewState.bBox.x + 10} y={viewState.bBox.y + 3}
                  className="parameter-text">{model.getParameterDefinitionAsString()}</text>
            <rect x={viewState.components.deleteIcon.x} y={viewState.components.deleteIcon.y }
                  width={viewState.components.deleteIcon.w + 2} height={viewState.components.deleteIcon.h + 7} rx="0" ry="0"
                  className="parameter-delete-icon-wrapper"/>
            <text x={viewState.components.deleteIcon.x + 8} y={viewState.components.deleteIcon.y + 16} width="14"
                   height="14" className="parameter-delete-icon"
                  onClick={() => this.onDelete()}>x</text>
            <rect x={viewState.components.deleteIcon.x + viewState.components.deleteIcon.w + 2}
                  y={viewState.components.deleteIcon.y} width={5} height={viewState.h} rx="0" ry="0"
                  className="parameter-space"/>
        </g>)
    }
}

export default ParameterDefinition;