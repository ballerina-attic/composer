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
import './variable-endpoint.css';

export default class VariableEndpoint extends React.Component {
    componentWillUnmount() {
        const { id, onRemove } = this.props;
        onRemove(id);
    }

    render() {
        const { variable, makeConnectPoint, type, level, id, removeTypeCallbackFunc, onClick, onRemove } = this.props;
        let iconType = 'fw-variable';

        if (variable.type === 'struct') {
            iconType = 'fw-struct';
        }

        return (
            <div className='transform-endpoint variable' style={{ paddingLeft: level > 0 ? ((level - 1) * 13) : 0 }}>
                <span >
                    {(level > 0) && <span className='tree-view-icon'></span>}
                    <span className='variable-icon'>
                        <i className={`transform-endpoint-icon fw ${iconType}`} />
                    </span>
                    <span className='variable-content' onClick={e => {onClick ? onClick(variable.name) : onRemove(id)}}>
                        {variable.name &&
                            <span className='property-name'>
                                {variable.displayName || variable.name}:
                            </span>
                        }
                        <span className='property-type'>
                            {variable.typeName || variable.type}
                        </span>
                    </span>
                </span>
                <span id={variable.id + '-button'} className='btn connect-point'>
                    <i
                        id={id}
                        ref={icon => makeConnectPoint(icon, id, variable)}
                        className='fw fw-circle-outline fw-stack-1x'
                    />
                </span>
            </div>
        );
    }
}
