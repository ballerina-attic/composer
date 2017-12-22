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
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';

/**
 * Drag source
 */

const boxSource = {
    beginDrag(props) {
        return {
            name: props.name,
        };
    },
};

class Box extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connectDragSource: PropTypes.func.isRequired,
            isDragging: PropTypes.bool.isRequired,
            name: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            isDropped: PropTypes.bool.isRequired,
        };
    }

    render() {
        const { name, value, isDropped, isDragging, connectDragSource } = this.props;
        const opacity = isDragging ? 0.4 : 1;

        const border = '1px dashed gray';
        const backgroundColor = '#5f5959';
        const padding = '0.5rem 1rem';
        const marginRight = '1.5rem';
        const marginBottom = '0.5rem';
        const cursor = 'move';
        const float = 'left';
        const width = '80px';

        return connectDragSource(
            <div style={{
                border,
                backgroundColor,
                padding,
                marginRight,
                marginBottom,
                cursor,
                float,
                opacity,
                width,
            }}
            >
                {isDropped ? <s>{name}</s> : name}
            </div>,
        );
    }
}
export default DragSource(props => props.type, boxSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}))(Box);
