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
import _ from 'lodash';
import { getPathSeperator, getUserHome } from 'api-client/api-client';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import ScrollBarsWithContextAPI from './../../view/scroll-bars/ScrollBarsWithContextAPI';
import Dialog from './../../view/Dialog';
import FileTree from './../../view/tree-view/FileTree';
import { createOrUpdate, exists as checkFileExists } from './../fs-util';
import { DIALOGS } from './../constants';
import { COMMANDS as LAYOUT_COMMANDS } from './../../layout/constants';

const FILE_TYPE = 'file';
const HISTORY_LAST_ACTIVE_PATH = 'composer.history.workspace.file-save-dialog.last-active-path';
const HISTORY_LAST_ACTIVE_NAME = 'composer.history.workspace.file-save-dialog.last-active-name';

/**
 * File Save Wizard Dialog
 * @extends React.Component
 */
class FileSaveDialog extends React.Component {

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        const { history } = props.workspaceManager.appContext.pref;
        const filePath = history.get(HISTORY_LAST_ACTIVE_PATH) || '';
        const fileName = history.get(HISTORY_LAST_ACTIVE_NAME) || '';
        this.state = {
            error: '',
            filePath,
            fileName,
            showDialog: true,
        };
        this.onFileSave = this.onFileSave.bind(this);
        this.onDialogHide = this.onDialogHide.bind(this);
    }

     /**
     * @inheritdoc
     */
    componentDidMount() {
        if (!this.state.filePath) {
            getUserHome()
                .then((userHome) => {
                    this.setState({
                        filePath: userHome,
                    });
                });
        }
    }

    /**
     * Called when user clicks open
     */
    onFileSave() {
        const { filePath, fileName } = this.state;
        if (fileName === '') {
            this.setState({
                error: 'File name cannot be empty',
            });
            return;
        }
        if (filePath === '') {
            this.setState({
                error: 'File path cannot be empty',
            });
            return;
        }
        const derivedFilePath = !_.endsWith(filePath, getPathSeperator())
                ? filePath + getPathSeperator() : filePath;
        const derivedFileName = !_.endsWith(fileName, '.xml')
                ? fileName + '.xml' : fileName;
        const file = this.props.file;

        const saveFile = () => {
            createOrUpdate(derivedFilePath, derivedFileName, file.content)
                .then((success) => {
                    this.setState({
                        error: '',
                        showDialog: false,
                    });
                    file.name = _.endsWith(fileName, '.xml') ? _.split(fileName, '.xml')[0] : fileName;
                    file.path = derivedFilePath;
                    file.extension = 'xml';
                    file.fullPath = derivedFilePath + derivedFileName;
                    file.isPersisted = true;
                    file.isDirty = false;
                    this.props.onSaveSuccess();
                    if (this.context.workspace.isFilePathOpenedInExplorer(derivedFilePath)) {
                        this.context.workspace.refreshPathInExplorer(derivedFilePath);
                        this.context.workspace.goToFileInExplorer(file.fullPath);
                    }
                })
                .catch((error) => {
                    this.setState({
                        error: error.message,
                    });
                    this.props.onSaveFail();
                });
        };

        checkFileExists(derivedFilePath + derivedFileName)
            .then(({ exists }) => {
                if (!exists) {
                    saveFile();
                } else {
                    const { command: { dispatch } } = this.props.workspaceManager.appContext;
                    dispatch(LAYOUT_COMMANDS.POPUP_DIALOG, {
                        id: DIALOGS.REPLACE_FILE_CONFIRM,
                        additionalProps: {
                            target: derivedFileName,
                            parent: derivedFilePath,
                            onConfirm: () => {
                                saveFile();
                            },
                            onCancel: () => {
                                this.props.onSaveFail();
                            },
                        },
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    error: error.message,
                });
                this.props.onSaveFail();
            });
    }

    /**
     * Called when user hides the dialog
     */
    onDialogHide() {
        this.setState({
            error: '',
            showDialog: false,
        });
    }

    /**
     * Update state and history
     *
     * @param {Object} state
     */
    updateState({ error, filePath = this.state.filePath, fileName = this.state.fileName }) {
        const { history } = this.props.workspaceManager.appContext.pref;
        history.put(HISTORY_LAST_ACTIVE_PATH, filePath);
        history.put(HISTORY_LAST_ACTIVE_NAME, fileName);
        this.setState({
            error,
            filePath,
            fileName,
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
            <div>
                <Dialog
                    show={this.state.showDialog}
                    title='Save File'
                    actions={
                        <Button
                            bsStyle='primary'
                            onClick={this.onFileSave}
                            disabled={this.state.filePath === '' || this.state.fileName === ''}
                        >
                            Save
                        </Button>
                    }
                    closeAction
                    onHide={this.onDialogHide}
                    error={this.state.error}
                >
                    <Form horizontal>
                        <FormGroup controlId='filePath'>
                            <Col componentClass={ControlLabel} sm={2}>
                                File Path
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            this.onFileSave();
                                        } else if (e.key === 'Escape') {
                                            this.onDialogHide();
                                        }
                                    }}
                                    value={this.state.filePath}
                                    onChange={(evt) => {
                                        this.updateState({
                                            error: '',
                                            filePath: evt.target.value,
                                        });
                                    }}
                                    type='text'
                                    placeholder='eg: /home/user/ballerina-services'
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup controlId='fileName'>
                            <Col componentClass={ControlLabel} sm={2}>
                                File Name
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            this.onFileSave();
                                        } else if (e.key === 'Escape') {
                                            this.onDialogHide();
                                        }
                                    }}
                                    value={this.state.fileName}
                                    onChange={(evt) => {
                                        this.updateState({
                                            error: '',
                                            fileName: evt.target.value,
                                        });
                                    }}
                                    type='text'
                                    placeholder='eg: routing.xml'
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                    <ScrollBarsWithContextAPI
                        style={{
                            margin: '15px 0 15px 40px',
                            width: 608,
                            height: 500,
                        }}
                        autoHide
                    >
                        <FileTree
                            activeKey={this.state.filePath}
                            onSelect={
                                (node) => {
                                    let filePath = node.id;
                                    let fileName = this.state.fileName;
                                    if (node.type === FILE_TYPE) {
                                        filePath = node.filePath;
                                        fileName = node.fileName + '.' + node.extension;
                                    }
                                    this.updateState({
                                        error: '',
                                        filePath,
                                        fileName,
                                    });
                                }
                            }
                        />
                    </ScrollBarsWithContextAPI>
                </Dialog>
            </div>
        );
    }
}

FileSaveDialog.contextTypes = {
    workspace: PropTypes.shape({
        isFilePathOpenedInExplorer: PropTypes.func,
        refreshPathInExplorer: PropTypes.func,
        goToFileInExplorer: PropTypes.func,
    }).isRequired,
};


FileSaveDialog.propTypes = {
    file: PropTypes.objectOf(Object).isRequired,
    onSaveSuccess: PropTypes.func,
    onSaveFail: PropTypes.func,
    workspaceManager: PropTypes.objectOf(Object).isRequired,
};

FileSaveDialog.defaultProps = {
    onSaveSuccess: () => {},
    onSaveFail: () => {},
};

export default FileSaveDialog;
