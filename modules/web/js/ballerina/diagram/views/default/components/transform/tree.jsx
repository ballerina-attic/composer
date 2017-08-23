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
import VariableEndpoint from './variable-endpoint.jsx';
import _ from 'lodash';
import './tree.css';

export default class Tree extends React.Component {
    renderStruct(endpoint, level) {
        const { foldedEndpoints, foldEndpoint } = this.props;
        return (<div key={endpoint.name}>
            {
                this.renderEndpoint(endpoint, (endpoint.isField ? 'property' : 'struct-head'),
                    level, foldEndpoint, Boolean(foldedEndpoints[endpoint.name]))
            }
            {
                !foldedEndpoints[endpoint.name] && endpoint.properties.map((property) => {
                    if (property.type === 'struct') {
                        return this.renderStruct(property, level + 1);
                    }
                    return this.renderEndpoint(property, 'property', level + 1);
                })
            }
        </div>);
    }

    renderEndpoint(endpoint, kind, level, onClick, isFolded) {
        const { endpoints, type, makeConnectPoint, onEndpointRemove, viewId, updateVariable } = this.props;
        const key = `${endpoint.name}:${viewId}`;

        return (
            <VariableEndpoint
                key={key}
                id={key}
                type={type}
                variable={endpoint}
                makeConnectPoint={makeConnectPoint}
                level={level}
                onClick={onClick}
                onRemove={onEndpointRemove}
                updateVariable={updateVariable}
                isFolded={isFolded}
            />
        );
    }

    render() {
        const { endpoints, type, removeTypeCallbackFunc } = this.props;
        return (
            <div className='transform-endpoint-tree'>
                {
                    endpoints.map((endpoint) => {
                        const className = `transform-endpoint-container transform-${type}`;
                        return (
                            <div key={endpoint.name} className={className}>
                                <div className='transform-endpoint-details'>
                                    {
                                        endpoint.type === 'struct' ?
                                            this.renderStruct(endpoint, 0) : this.renderEndpoint(endpoint, 'variable', 0)
                                    }
                                    {
                                        (type === 'source' || type === 'target') &&
                                        <span
                                            onClick={() => removeTypeCallbackFunc(endpoint)}
                                            className='fw-stack fw-lg btn btn-remove'
                                        >
                                        <i className='fw fw-delete fw-stack-1x' />
                                    </span>
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
