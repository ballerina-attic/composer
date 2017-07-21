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
import DebugManager from './debug-manager';

/**
 * Higher order component to add add/remove breakpoint for diagram view nodes
 * @param {React.Component} WrappedComponent - React component to be wrapped
 * @returns {React.Component} - WrappedComponent with props addBreakpoints, showDebugHit
 */
function debuggerHOC(WrappedComponent) {
    const newComponent = class DebuggerHOC extends React.Component {
        constructor() {
            super();
            this.state = {
                breakpoints: [],
                sourceViewBreakpoints: [],
                debugHit: null,
            };
        }
        /**
         * hook for componentDidMount
         */
        componentDidMount() {
            this.addListner = DebugManager.on('breakpoint-added', this.updateBreakpoints.bind(this));
            this.removeListner = DebugManager.on('breakpoint-removed', this.updateBreakpoints.bind(this));
            this.hitListner = DebugManager.on('debug-hit', this.debugHit.bind(this));
            this.endListner = DebugManager.on('session-ended', this.end.bind(this));
            this.cmpListner = DebugManager.on('session-completed', this.end.bind(this));
            this.resumeListner = DebugManager.on('resume-execution', this.end.bind(this));
        }
        /**
         * hook for componentWillUnmount
         */
        componentWillUnmount() {
            DebugManager.off('breakpoint-added', this.addListner, this);
            DebugManager.off('breakpoint-removed', this.removeListner, this);
            DebugManager.off('debug-hit', this.hitListner, this);
            DebugManager.off('session-ended', this.endListner, this);
            DebugManager.off('session-completed', this.cmpListner, this);
            DebugManager.off('resume-execution', this.resumeListner, this);
        }

        /**
         * get file name with package path
         *
         * @returns string - file name with package path
          */
        getFileNameWithPackage() {
            const fileName = this.props.file.getName();
            const packagePath = this.props.file.getPackageName() || '.';
            if (packagePath !== '.') {
                return `${packagePath.replace(/\./g, '/')}/${fileName}`;
            }
            return fileName;
        }
        /**
         * update breakpoints
         */
        updateBreakpoints() {
            const fileName = this.getFileNameWithPackage();
            const breakpoints = DebugManager.getDebugPoints(fileName);
            const sourceViewBreakpoints = breakpoints.map(breakpoint => breakpoint - 1);
            this.setState({
                breakpoints,
                sourceViewBreakpoints,
            });
        }
        /**
         * indicate debughit
         *
         * @param {object} message - parsed message from backend
         */
        debugHit(message) {
            const fileName = this.getFileNameWithPackage();
            const position = message.location;
            if (fileName === position.fileName) {
                this.setState({
                    debugHit: position.lineNumber - 1,
                });
            }
        }
        /**
         * end debug session
         */
        end() {
            this.setState({
                debugHit: null,
            });
        }
        /**
         * add breakpoint
         */
        addBreakpoint(lineNumber) {
            const fileName = this.getFileNameWithPackage();
            DebugManager.addBreakPoint(lineNumber, fileName);
        }
        /**
         * remove breakpoint
         */
        removeBreakpoint(lineNumber) {
            const fileName = this.getFileNameWithPackage();
            DebugManager.removeBreakPoint(lineNumber, fileName);
        }

        /**
         * @inheritdoc
         */
        render() {
            const newProps = {
                breakpoints: this.state.breakpoints,
                debugHit: this.state.debugHit,
                sourceViewBreakpoints: this.state.sourceViewBreakpoints,
                addBreakpoint: this.addBreakpoint.bind(this),
                removeBreakpoint: this.removeBreakpoint.bind(this),
            };
            return <WrappedComponent {...this.props} {...newProps} />;
        }
    };

    newComponent.propTypes = {
        file: PropTypes.instanceOf(Object).isRequired,
    };

    return newComponent;
}


export default debuggerHOC;
