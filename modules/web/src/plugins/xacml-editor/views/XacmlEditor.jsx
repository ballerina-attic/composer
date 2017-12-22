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
import { EVENTS as EDITOR_EVENTS } from 'core/editor/constants';
import { withUndoRedoSupport } from 'core/editor/views/utils';
import { EVENTS as WORKSPACE_EVENTS } from 'core/workspace/constants';
import Sortable_tree from '/home/chathurangi/GIT/composer/modules/web/src/plugins/xacml-editor/src/containers/sortable_tree.js';
import convert from 'xml-js';
/**
 * Editor for Xacml Files
 */
class Editor extends React.Component {

    /**
     * @inheritdoc
     */
    constructor(...args) {
        super(...args);
        this.onFileContentModified = this.onFileContentModified.bind(this);
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        this.props.file.on(WORKSPACE_EVENTS.CONTENT_MODIFIED, this.onFileContentModified);
    }

    /**
     * @inheritdoc
     */
    shouldComponentUpdate(nextProps) {
        return nextProps.isActive;
    }

    /**
     * On File Modifications
     */
    onFileContentModified(changeEvent) {
        if (changeEvent.originEvt.type !== EDITOR_EVENTS.UNDO_EVENT
            && changeEvent.originEvt.type !== EDITOR_EVENTS.REDO_EVENT) {
            // TODO: Make undo/redo work
            // this.props.onUndoableOperation(undoableOp);
        }
    }

    /**
     * @inheritdoc
     */
    componetWillUnmount() {
        this.props.file.off(WORKSPACE_EVENTS.CONTENT_MODIFIED, this.onFileContentModified);
    }

    /**
     * @inheritdoc
     */
    render() {
        const { width, height } = this.props;
        return (
        // result1 = convert.xml2json(this.props.file.content, {compact: true, spaces: ' ' }),
            <div className='xacml-editor' style={{ width, height }}>
                <p>
                    {this.props.file.content}
                    {/* <MainWindow/> */}
                    {<Sortable_tree />}
                </p>
                {/* <p> */}
                {/* {convert.xml2json(this.props.file.content, {compact: true, spaces: '\t' })} */}
                {/* </p> */}
            </div>
        );
    }
}

Editor.propTypes = {
    file: PropTypes.objectOf(Object).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

Editor.defaultProps = {
    isPreviewViewEnabled: false,
};

export default withUndoRedoSupport(Editor);
