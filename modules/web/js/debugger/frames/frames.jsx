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
import TreeView from 'react-treeview';
import ReactJson from 'react-json-view';
import JSON5 from 'json5';
import HTMLTree from 'react-htmltree';
import 'react-treeview/react-treeview.css';
import './frames.css';
/**
 *
 *
 * @class Frames
 * @extends {React.Component}
 */
class Frames extends React.Component {
    /**
     * @description Parse string to JSON (using json5 since input is not a valid json)
     * @param {string} str
     * @returns {ReactNode}
     * @memberof Frames
     */
    getObject(str) {
        return JSON5.parse(str.substring(str.indexOf('{'), str.lastIndexOf('}') + 1));
    }
    /**
     * @description Parse string to JSON
     * @param {any} str
     * @returns {ReactNode}
     * @memberof Frames
     */
    getArray(str) {
        return JSON.parse(str.substring(str.indexOf('] [') + 2, str.lastIndexOf(']') + 1));
    }
    /**
     * Render a Frame
     * @param {object} frame - Frame object
     * @param {int} i - key
     * @returns {ReactNode}
     * @memberof Frames
     */
    renderFrame(frame, i) {
        frame.variables = frame.variables || [];
        return (
            <div key={i}>
                {frame.variables.map((variable, j) => {
                    const { type = '', name, value, scope } = variable;
                    const label = <span className="node"><strong>{name}</strong>{` = (${type})`}</span>;
                    if (type === 'json' || type === 'struct') {
                        return (
                            <TreeView key={j} nodeLabel={label} defaultCollapsed>
                                <div className="node">Type: {type}</div>
                                <div className="node">Scope: {scope}</div>
                                <div className="node">Value:</div>
                                <ReactJson
                                    src={this.getObject(variable.value)}
                                    theme='eighties'
                                    name={name}
                                    displayDataTypes={false}
                                    collapsed={1}
                                    displayObjectSize={false}
                                />
                            </TreeView>);
                    } else if (type.toLowerCase().includes('array')) {
                        return (
                            <TreeView key={j} nodeLabel={label} defaultCollapsed>
                                <div className="node">Type: {type}</div>
                                <div className="node">Scope: {scope}</div>
                                <div className="node">Value:</div>
                                <ReactJson
                                    src={this.getArray(variable.value)}
                                    theme='eighties'
                                    name={name}
                                    displayDataTypes={false}
                                    collapsed={1}
                                    displayObjectSize={false}
                                />
                            </TreeView>
                        );
                    } else if (type.toLowerCase().includes('xml')) {
                        return (
                            <TreeView key={j} nodeLabel={label} defaultCollapsed>
                                <div className="node">Type: {type}</div>
                                <div className="node">Scope: {scope}</div>
                                <div className="node">Value:</div>
                                <HTMLTree source={variable.value} theme="firefox-devtools.dark" />
                            </TreeView>
                        );
                    } else {
                        const varLabel = <span className="node"><strong>{name}</strong>{` = (${type}) ${value}`}</span>;
                        return (
                            <TreeView key={j} nodeLabel={varLabel} defaultCollapsed>
                                <div className="node">Type: {type}</div>
                                <div className="node">Scope: {scope}</div>
                                <div className="node">Value: {value}</div>
                            </TreeView>
                        );
                    }
                })}
            </div>
        );
    }
    /**
     * @inheritdoc
     * @memberof Frames
     */
    render() {
        const { message: { frames } } = this.props;
        return (
            <div>
                <div className="debug-panel-header debug-frame-header">
                    <div><a className="tool-group-header-title">Frames</a></div>
                </div>
                <div className="panel-group" id="frameAccordion">
                    {frames.map((frame, i) => {
                        return (
                            <div className="panel panel-default" key={frame.frameName}>
                                <div className="panel-heading">
                                    <h4 className="panel-title">
                                        <a
                                            data-toggle="collapse"
                                            data-parent={`#debugger-frame-${frame.frameName}`}
                                            href={`#${frame.frameName}`}
                                        >
                                            {`${frame.frameName}`}
                                            <span className="debug-frame-pkg-name">
                                                <i className="fw fw-package"></i>{`${frame.packageName}`}
                                            </span>
                                        </a>
                                    </h4>
                                </div>
                                <div
                                    id={`#debugger-frame-${frame.frameName}`}
                                    className="panel-collapse collapse in"
                                >
                                    <div className="panel-body">
                                        {this.renderFrame(frame, i)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

Frames.propTypes = {
    message: PropTypes.object,
};

Frames.defaultProps = {
    message: {},
};

export default Frames;
