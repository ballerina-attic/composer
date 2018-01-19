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
import _ from 'lodash';
import log from 'log';
import Plugin from 'core/plugin/plugin';
import { listen } from 'vscode-ws-jsonrpc';
import { setTimeout } from 'timers';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { parseFile, getPathSeperator, getServiceEndpoint } from 'api-client/api-client';
import { CONTRIBUTIONS } from 'core/plugin/constants';
import { REGIONS, COMMANDS as LAYOUT_COMMANDS } from 'core/layout/constants';
import { EVENTS as WORKSPACE_EVENTS, COMMANDS as WORKSPACE_CMDS } from 'core/workspace/constants';
import { createOrUpdate, move } from 'core/workspace/fs-util';
import { CLASSES } from 'plugins/ballerina/views/constants';
import Document from 'plugins/ballerina/docerina/document.jsx';
import Editor from './views/editor-wrapper';
import { PLUGIN_ID, EDITOR_ID, DOC_VIEW_ID, COMMANDS as COMMAND_IDS, TOOLS as TOOL_IDS,
            DIALOGS as DIALOG_IDS, EVENTS } from './constants';
import OpenProgramDirConfirmDialog from './dialogs/OpenProgramDirConfirmDialog';
import FixPackageNameOrPathConfirmDialog from './dialogs/FixPackageNameOrPathConfirmDialog';
import { isInCorrectPath, getCorrectPackageForPath, getCorrectPathForPackage } from './utils/program-dir-utils';
import TreeBuilder from './model/tree-builder';
import FragmentUtils from './utils/fragment-utils';


/**
 * Plugin for Ballerina Lang
 */
class BallerinaPlugin extends Plugin {

    /**
     * @inheritdoc
     */
    constructor() {
        super();
        this.langServerConnection = undefined;
        this.getLangServerConnection = this.getLangServerConnection.bind(this);
    }

    /**
     * @inheritdoc
     */
    init(config) {
        super.init(config);
        return {
            getLangServerConnection: this.getLangServerConnection,
        };
    }

    /**
     * @inheritdoc
     */
    getID() {
        return PLUGIN_ID;
    }

    /**
     * Create a connection to langserver
     */
    getLangServerConnection() {
        return new Promise((resolve, reject) => {
            if (this.langServerConnection) {
                resolve(this.langServerConnection);
            } else {
                // Wait some time till the connection is available
                setTimeout(() => {
                    resolve(this.langServerConnection);
                }, 1000);
            }
        });
    }

    /**
     * @inheritdoc
     */
    activate(appContext) {
        super.activate(appContext);
        const socketOptions = {
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 10000,
            maxRetries: Infinity,
            debug: false,
        };
        // create the web socket
        const url = getServiceEndpoint('ballerina-langserver');
        const webSocket = new ReconnectingWebSocket(url, undefined, socketOptions);
        // listen when the web socket is opened
        listen({
            webSocket,
            onConnection: (connection) => {
                this.langServerConnection = connection;
            },
        });
    }

    /**
     * @inheritdoc
     */
    getContributions() {
        const { EDITORS, TOOLS, VIEWS, HANDLERS, DIALOGS } = CONTRIBUTIONS;
        return {
            [EDITORS]: [
                {
                    id: EDITOR_ID,
                    extension: 'bal',
                    component: Editor,
                    customPropsProvider: () => {
                        return {
                            ballerinaPlugin: this,
                        };
                    },
                    tabTitleClass: CLASSES.TAB_TITLE.DESIGN_VIEW,
                    newFileContentProvider: (fileFullPath) => {
                        if (!fileFullPath) {
                            return '';
                        }
                        const { workspace } = this.appContext;
                        const pathSep = getPathSeperator();
                        const pathParts = fileFullPath.split(pathSep);
                        pathParts.splice(-1, 1);
                        const filePath = pathParts.join(pathSep);
                        const workspaceDir = workspace.getExplorerFolderForPath(filePath);
                        const programDir = workspaceDir ? workspaceDir.fullPath : undefined;
                        const pkg = getCorrectPackageForPath(programDir, filePath);
                        return pkg ? `package ${pkg};` : '';
                    },
                },
            ],
            [TOOLS]: [
                {
                    id: TOOL_IDS.DEFAULT_VIEWS,
                    group: TOOL_IDS.GROUP,
                    icon: 'default-view',
                    commandID: COMMAND_IDS.DIAGRAM_MODE_CHANGE,
                    commandArgs: { mode: 'default' },
                    isActive: () => {
                        const { editor } = this.appContext;
                        const activeEditor = editor.getActiveEditor();
                        return (activeEditor && activeEditor.file);
                    },
                    description: 'Default View',
                },
                {
                    id: TOOL_IDS.ACTION_VIEW,
                    group: TOOL_IDS.GROUP,
                    icon: 'action-view',
                    commandID: COMMAND_IDS.DIAGRAM_MODE_CHANGE,
                    commandArgs: { mode: 'action' },
                    isActive: () => {
                        const { editor } = this.appContext;
                        const activeEditor = editor.getActiveEditor();
                        return (activeEditor && activeEditor.file);
                    },
                    description: 'Action View',
                },
            ],
            [VIEWS]: [
                {
                    id: DOC_VIEW_ID,
                    component: Document,
                    propsProvider: () => {
                        return {};
                    },
                    region: REGIONS.EDITOR_TABS,
                    regionOptions: {
                        tabTitle: ({ packageName }) => `${packageName} docs`,
                        customTitleClass: CLASSES.TAB_TITLE.DESIGN_VIEW,
                    },
                    displayOnLoad: false,
                },
            ],
            [HANDLERS]: [
                {
                    cmdID: EVENTS.UPDATE_PACKAGE_DECLARATION,
                    handler: ({ packageName, file, ast }) => {
                        if (file.isPersisted && !isInCorrectPath(packageName, file.path)) {
                            const { editor, workspace, command: { dispatch } } = this.appContext;
                            if (workspace.isFilePathOpenedInExplorer(file.fullPath)) {
                                const programDir = workspace.getExplorerFolderForPath(file.fullPath).fullPath;
                                const correctPkg = getCorrectPackageForPath(programDir, file.path);
                                const correctPath = getCorrectPathForPackage(programDir, packageName);
                                const onMoveFile = () => {
                                    // File is already persisted
                                    createOrUpdate(file.path, file.name + '.' + file.extension, file.content)
                                    .then((success) => {
                                        if (success) {
                                            file.isDirty = false;
                                            file.lastPersisted = _.now();
                                            return move(file.fullPath, correctPath + file.name + '.' + file.extension)
                                                .then((sucess) => {
                                                    if (sucess) {
                                                        // if the old file was opened in an editor,
                                                        // close it and reopen a new tab
                                                        if (editor.isFileOpenedInEditor(file.fullPath)) {
                                                            const targetEditor = editor.getEditorByID(file.fullPath);
                                                            const wasActive =
                                                                editor.getActiveEditor().id === targetEditor.id;
                                                            dispatch(WORKSPACE_CMDS.OPEN_FILE, {
                                                                filePath: correctPath + file.name + '.' +
                                                                    file.extension,
                                                                activate: wasActive,
                                                            });
                                                            editor.closeEditor(targetEditor,
                                                                wasActive ? editor.getActiveEditor() : undefined);
                                                        }
                                                        workspace.refreshPathInExplorer(correctPath);
                                                    }
                                                });
                                        } else {
                                            throw new Error('Error while saving file ' + file.fullPath);
                                        }
                                    })
                                    .catch((error) => {
                                        log.error(error);
                                    });
                                };

                                const onFixPackage = () => {
                                    const pkgName = `package ${correctPkg};`;
                                    const fragment = FragmentUtils.createTopLevelNodeFragment(pkgName);
                                    const parsedJson = FragmentUtils.parseFragment(fragment);
                                    // If there's no packageDeclaration node, then create one
                                    if (ast.filterTopLevelNodes({ kind: 'PackageDeclaration' }).length === 0) {
                                        ast.addTopLevelNodes(TreeBuilder.build(parsedJson), 0);
                                    } else {
                                        // If a packageDeclaratioNode already exists then -
                                        // remove that node, and add a new one
                                        const pkgDeclarationNode =
                                            ast.filterTopLevelNodes({ kind: 'PackageDeclaration' })[0];
                                        ast.removeTopLevelNodes(pkgDeclarationNode, true);
                                        ast.addTopLevelNodes(TreeBuilder.build(parsedJson), 0);
                                    }
                                };

                                dispatch(LAYOUT_COMMANDS.POPUP_DIALOG, {
                                    id: DIALOG_IDS.FIX_PACKAGE_NAME_OR_PATH_CONFIRM,
                                    additionalProps: {
                                        file,
                                        programDir,
                                        correctPkg,
                                        correctPath,
                                        onMoveFile,
                                        onFixPackage,
                                    },
                                });
                            }
                        }
                    },
                },
                {
                    cmdID: WORKSPACE_EVENTS.FILE_OPENED,
                    handler: ({ file }) => {
                        parseFile(file)
                            .then(({ programDirPath = undefined }) => {
                                const { workspace, command: { dispatch } } = this.appContext;
                                if (programDirPath && !workspace.isFilePathOpenedInExplorer(programDirPath)) {
                                    dispatch(LAYOUT_COMMANDS.POPUP_DIALOG, {
                                        id: DIALOG_IDS.OPEN_PROGRAM_DIR_CONFIRM,
                                        additionalProps: {
                                            file,
                                            programDirPath,
                                            onConfirm: () => {
                                                workspace.openFolder(programDirPath);
                                            },
                                        },
                                    });
                                }
                            });
                    },
                },
            ],
            [DIALOGS]: [
                {
                    id: DIALOG_IDS.OPEN_PROGRAM_DIR_CONFIRM,
                    component: OpenProgramDirConfirmDialog,
                    propsProvider: () => {
                        return {
                            ballerinaPlugin: this,
                        };
                    },
                },
                {
                    id: DIALOG_IDS.FIX_PACKAGE_NAME_OR_PATH_CONFIRM,
                    component: FixPackageNameOrPathConfirmDialog,
                    propsProvider: () => {
                        return {
                            ballerinaPlugin: this,
                        };
                    },
                },
            ],
        };
    }

}

export default BallerinaPlugin;
