/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import $ from 'jquery';
import _ from 'lodash';
import log from 'log';
import Dialogs from 'dialog/module';
import WelcomePages from 'welcome-page/module';
import Tab from 'tab/module';
import alerts from 'alerts';
import ServiceClient from './service-client';
import 'bootstrap';

// workspace manager constructor
/**
 * Arg: application instance
 */
class WorkspaceManager {

    constructor (application) {
        this.app = application;
        this._serviceClient = new ServiceClient({application: this.app});

        if (_.isUndefined(this.app.commandManager)) {
            var error = 'CommandManager is not initialized.';
            log.error(error);
            throw error;
        }
        this.app.commandManager.registerHandler('create-new-tab', this.createNewTab, this);

        this.app.commandManager.registerHandler('undo', this.handleUndo, this);

        this.app.commandManager.registerHandler('redo', this.handleRedo, this);

        this.app.commandManager.registerHandler('save', this.handleSave, this);

        this.app.commandManager.registerHandler('format', this.handleFormat, this);

        // Open file save dialog
        this.app.commandManager.registerHandler('open-file-save-dialog', this.openFileSaveDialog, this);

        // Open file open dialog
        this.app.commandManager.registerHandler('open-file-open-dialog', this.openFileOpenDialog, this);

        // Open settings dialog
        this.app.commandManager.registerHandler('open-settings-dialog', this.openSettingsDialog, this);

        this.app.commandManager.registerHandler('show-folder-open-dialog', this.showFolderOpenDialog, this);

        this.app.commandManager.registerHandler('open-close-file-confirm-dialog', this.openCloseFileConfirmDialog, this);

        this.app.commandManager.registerHandler('open-replace-file-confirm-dialog', this.openReplaceFileConfirmDialog, this);

        // Go to Welcome Page.
        this.app.commandManager.registerHandler('go-to-welcome-page', this.goToWelcomePage);

        this.app.commandManager.registerHandler('show-about-dialog', this.showAboutDialog);

        this.app.commandManager.registerHandler('create-new-item-at-path', this.handleCreateNewItemAtPath, this);

        this.app.commandManager.registerHandler('remove-from-disk', this.handleRemoveFromDisk, this);

        // Go to User Guide.
        this.app.commandManager.registerHandler('go-to-user-guide', this.showUserGuide, this);
    }

    getServiceClient(){
        return this._serviceClient;
    }

    listenToTabController (){
        this.app.tabController.on('active-tab-changed', this.onTabChange, this);
    }

    onTabChange(){
        this.updateMenuItems();
    }

    createNewTab(options) {
        this.app.tabController.newTab(options);
    }

    displayInitialTab() {
        //TODO : remove this if else condition
        // display first launch welcome page tab
        if (!this.passedFirstLaunch()) {
            // create a generic tab - without ballerina editor components
            let tab = this.app.tabController.newTab({
                tabModel: Tab.Tab,
                tabOptions:{title: 'welcome-page'}
            });
            let opts = _.get(this.app.config, 'welcome');
            _.set(opts, 'application', this.app);
            _.set(opts, 'tab', tab);
            this.welcomePage = new WelcomePages.FirstLaunchWelcomePage(opts);
            this.welcomePage.render();
        } else {
            // user has no active tabs from last session
            if (!this.app.tabController.hasFilesInWorkingSet()) {
                // create a generic tab - without ballerina editor components
                let tab = this.app.tabController.newTab({
                    tabModel: Tab.Tab,
                    tabOptions:{title: 'welcome-page'}
                });
                // Showing FirstLaunchWelcomePage instead of regularWelcomePage
                let opts = _.get(this.app.config, 'welcome');
                _.set(opts, 'application', this.app);
                _.set(opts, 'tab', tab);
                this.welcomePage = new WelcomePages.FirstLaunchWelcomePage(opts);
                this.welcomePage.render();
            }
        }
    }

    passedFirstLaunch(){
        return this.app.browserStorage.get('pref:passedFirstLaunch') || false;
    }

    /**
     * Showing the welcome page. If "welcome page" exists, then show existing "welcome page", else create new
     * "welcome page".
     * @param workspaceManager - The workspace manager.
     */
    showWelcomePage(workspaceManager) {
        var existingWelcomeTab = _.find(this.app.tabController.getTabList(), function (tab) {
            return tab._title === 'welcome-page';
        });

        if (_.isUndefined(existingWelcomeTab)) {
            // Creating a new welcome tab.
            var tab = this.app.tabController.newTab({
                tabModel: Tab.Tab,
                tabOptions:{title: 'welcome-page'}
            });
            // Showing FirstLaunchWelcomePage instead of regularWelcomePage
            var opts = _.get(this.app.config, 'welcome');
            _.set(opts, 'application', this.app);
            _.set(opts, 'tab', tab);
            workspaceManager.welcomePage = new WelcomePages.FirstLaunchWelcomePage(opts);
            workspaceManager.welcomePage.render();
        } else {
            // Showing existing welcome tab.
            this.app.tabController.setActiveTab(existingWelcomeTab);
        }
    }

    openFileSaveDialog (options) {
        if(this.app.isElectronMode()) {
            this.openNativeFileSaveDialog(options);
        } else {
            if(_.isNil(this._saveFileDialog)){
                this._saveFileDialog = new Dialogs.save_to_file_dialog(this.app);
            }
            this._saveFileDialog.render();

            if(!_.isNil(options) && _.isFunction(options.callback)){
                var isSaved = false;
                this._saveFileDialog.once('save-completed', function(success){
                    isSaved = success;
                }, this);
                this._saveFileDialog.once('unloaded', function(){
                    options.callback(isSaved);
                }, this);
            }

            this._saveFileDialog.show();
            var activeTab = this.app.tabController.getActiveTab();
            if(!_.isNil(activeTab) && _.isFunction(activeTab.getFile)){
                var activeFile = activeTab.getFile();
                if(activeFile.isPersisted()){
                    this._saveFileDialog.once('loaded', function(){
                        this._saveFileDialog.setSelectedFile(activeFile.getPath(), activeFile.getName());
                    }, this);
                }
            }
        }
    }

    openNativeFileSaveDialog (options) {
        let renderer = this.app.getNativeRenderProcess(),
            fileSavedCallback = (!_.isNil(options)) ? options.callback : undefined;
        renderer.send('show-file-save-dialog');
        renderer.once('file-save-path-selected', (event, path) => {
            let activeTab = this.app.tabController.getActiveTab();
            if(!_.isNil(activeTab) && _.isFunction(activeTab.getFile)) {
                let activeFile = activeTab.getFile(),
                    folderPath = path.substring(0, path.lastIndexOf(this.app.getPathSeperator())),
                    fileName = path.substring(path.lastIndexOf(this.app.getPathSeperator()) + 1),
                    config = activeTab.getBallerinaFileEditor().getContent();

                activeFile.setPath(folderPath)
                          .setName(fileName)
                          .setContent(config);

                let result = this._serviceClient.writeFile(activeFile);
                if(!_.isNil(fileSavedCallback) && _.isFunction(fileSavedCallback)) {
                    if (_.isNil(result) || result.error) {
                        fileSavedCallback(false);
                        if(!_.isNil(result.message)) {
                            alerts.error(result.message);
                        }
                    } else {
                        fileSavedCallback(true);
                    }
                }
            }
        });
    }

    openSettingsDialog(){
        /*var settingsModal = $(_.get(app, 'config.settings_dialog.selector'));
        settingsModal.modal('show');*/
        if(_.isNil(this._openFileDialog)){
            var opts = _.cloneDeep(_.get(this.app.config, 'settings_dialog'));
            _.set(opts, 'application', this.app);
            this._openSettingsDialog = new Dialogs.SettingsDialog(opts);
        }
        this._openSettingsDialog.render();
        this._openSettingsDialog.show();
    }

    showFolderOpenDialog () {
        if(this.app.isElectronMode()) {
            this.openNativeFolderOpenDialog();
        } else {
            if(_.isNil(this._folderOpenDialog)){
                var opts = _.cloneDeep(_.get(this.app.config, 'open_folder_dialog'));
                _.set(opts, 'application', this.app);
                this._folderOpenDialog = new Dialogs.FolderOpenDialog(opts);
            }
            this._folderOpenDialog.render();
            this._folderOpenDialog.show();
        }
    }

    openNativeFolderOpenDialog () {
        let renderer = this.app.getNativeRenderProcess();
        renderer.send('show-folder-open-dialog');
        renderer.once('folder-opened', (event, path) => {
            this.app.commandManager.dispatch('open-folder', path);
        });
    }

    openFileOpenDialog () {
        if(this.app.isElectronMode()) {
            this.openNativeFileOpenDialog();
        } else {
            if(_.isNil(this._openFileDialog)){
                this._openFileDialog = new Dialogs.open_file_dialog(this.app);
            }
            this._openFileDialog.render();
            this._openFileDialog.show();
        }
    }

    openNativeFileOpenDialog () {
        let renderer = this.app.getNativeRenderProcess();
        renderer.send('show-file-open-dialog');
        renderer.once('file-opened', (event, path) => {
            this.app.commandManager.dispatch('open-file', path);
        });
    }

    openCloseFileConfirmDialog (options) {
        if(_.isNil(this._closeFileConfirmDialog)){
            this._closeFileConfirmDialog = new Dialogs.CloseConfirmDialog();
            this._closeFileConfirmDialog.render();
        }
        this._closeFileConfirmDialog.askConfirmation(options);
    }

    openReplaceFileConfirmDialog(options) {
        if(_.isNil(this._replaceFileConfirmDialog)){
            this._replaceFileConfirmDialog = new Dialogs.ReplaceConfirmDialog();
        }
        // This dialog need to be re-rendered so that it comes on top of save file dialog.
        this._replaceFileConfirmDialog.render();

        this._replaceFileConfirmDialog.askConfirmation(options);
    }

    goToWelcomePage () {
        this.workspaceManager.showWelcomePage(this.workspaceManager);
    }

    updateUndoRedoMenus (){
        // undo manager for current tab
        var activeTab = this.app.tabController.getActiveTab(),
            undoMenuItem = this.app.menuBar.getMenuItemByID('edit.undo'),
            redoMenuItem = this.app.menuBar.getMenuItemByID('edit.redo');

        if(activeTab instanceof Tab.FileTab){
            var fileEditor = activeTab.getBallerinaFileEditor();
            if(!_.isUndefined(fileEditor)){
                var undoManager = activeTab.getBallerinaFileEditor().getUndoManager();
                if (undoManager.hasUndo() && undoManager.undoStackTop().canUndo()) {
                    undoMenuItem.enable();
                    // undoMenuItem.addLabelSuffix(
                    //     undoManager.undoStackTop().getTitle());
                } else {
                    undoMenuItem.disable();
                    undoMenuItem.clearLabelSuffix();
                }
                if (undoManager.hasRedo() && undoManager.redoStackTop().canRedo()) {
                    redoMenuItem.enable();
                    // redoMenuItem.addLabelSuffix(
                    //     undoManager.redoStackTop().getTitle());
                } else {
                    redoMenuItem.disable();
                    redoMenuItem.clearLabelSuffix();
                }
            }
        } else {
            undoMenuItem.disable();
            undoMenuItem.clearLabelSuffix();
            redoMenuItem.disable();
            redoMenuItem.clearLabelSuffix();
        }
    }

    updateMenuItems(){
        this.updateUndoRedoMenus();
        this.updateSaveMenuItem();
        this.updateCodeFormatMenu();
    }

    updateSaveMenuItem (){
        var activeTab = this.app.tabController.getActiveTab(),
            saveMenuItem = this.app.menuBar.getMenuItemByID('file.save'),
            saveAsMenuItem = this.app.menuBar.getMenuItemByID('file.saveAs');
        if(activeTab instanceof Tab.FileTab){
            var file = activeTab.getFile();
            if(file.isDirty()){
                saveMenuItem.enable();
                saveAsMenuItem.enable();
            } else {
                saveMenuItem.disable();
            }
        } else {
            saveMenuItem.disable();
            saveAsMenuItem.disable();
        }
    }

    updateCodeFormatMenu(){
        var activeTab = this.app.tabController.getActiveTab(),
            codeFormatMenuItem = this.app.menuBar.getMenuItemByID('code.format');
        if(activeTab instanceof Tab.FileTab){
            var fileEditor = activeTab.getBallerinaFileEditor();
            if(!_.isNil(fileEditor) && fileEditor.isInSourceView()){
                codeFormatMenuItem.enable();
            } else {
                codeFormatMenuItem.disable();
            }
        } else {
            codeFormatMenuItem.disable();
        }
    }

    handleUndo() {
        // undo manager for current tab
        var undoManager = this.app.tabController.getActiveTab().getBallerinaFileEditor().getUndoManager();
        if (undoManager.hasUndo()) {
            undoManager.undo();
        }
        this.updateUndoRedoMenus();
    }

    handleRedo() {
        // undo manager for current tab
        var undoManager = this.app.tabController.getActiveTab().getBallerinaFileEditor().getUndoManager();
        if (undoManager.hasRedo()) {
            undoManager.redo();
        }
        this.updateUndoRedoMenus();
    }

    handleSave(options) {
        var activeTab = this.app.tabController.getActiveTab();
        if(activeTab instanceof Tab.FileTab){
            var file = activeTab.getFile();
            if(file.isPersisted()){
                if(file.isDirty()){
                    var response = this._serviceClient.writeFile(file);
                    if(response.error){
                        alerts.error(response.message);
                        return;
                    }
                    if(activeTab.getBallerinaFileEditor().isInSourceView()){
                        activeTab.getBallerinaFileEditor().getSourceView().markClean();
                    }
                }
                if(!_.isNil(options) && _.isFunction(options.callback)){
                    options.callback(true);
                }
            } else {
                this.app.commandManager.dispatch('open-file-save-dialog', options);
            }
        }
    }

    handleFormat() {
        if(this.app.tabController.getActiveTab() instanceof Tab.FileTab){
            this.app.tabController.getActiveTab().getBallerinaFileEditor().getSourceView().format();
        }
    }

    showAboutDialog(){
        var aboutDialog = $(_.get(this, 'config.about_dialog.selector'));
        aboutDialog.modal('show');
    }

    showUserGuide() {
        window.open(this.app.config.menu_bar.help_urls.user_guide_url);
    }

    handleCreateNewItemAtPath(data){
        if(_.isNil(this._newItemDialog)){
            this._newItemDialog = new Dialogs.NewItemDialog({application: this.app});
            this._newItemDialog.render();
        }
        this._newItemDialog.displayWizard(data);
    }

    handleRemoveFromDisk(data){
        if(_.isNil(this._deleteItemWizard)){
            this._deleteItemWizard = new Dialogs.DeleteItemDialog({application: this.app});
            this._deleteItemWizard.render();
        }
        this._deleteItemWizard.displayWizard(data);
    }
}

export default WorkspaceManager;
