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

import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import './dialog.css';

const SettingsDialog = Backbone.View.extend(
    /** @lends SettingsDialog.prototype */
    {
        /**
         * @augments Backbone.View
         * @constructs
         * @class SettingsDialog
         * @param {Object} options configuration options
         */
        initialize(options) {
            this._options = options;
            this.application = _.get(options, 'application');
            this._dialogContainer = $(_.get(options, 'application.config.dialog.container'));
        },

        show() {
            this._modalContainer.modal('show');
        },

        setSelectedFolder(path) {
            this._fileBrowser.select(path);
        },

        render() {
            const app = this.application;
            const options = this._options;

            if (!_.isNil(this._modalContainer)) {
                this._modalContainer.remove();
            }

            const settingsModal = $(_.get(options, 'selector')).clone();

            settingsModal.find('select').filter('#sourceViewFontSize').change(function () {
                const fontSize = $(this).val();
                app.browserStorage.put('pref:sourceViewFontSize', fontSize);
                app.reRender();
            }).val(app.browserStorage.get('pref:sourceViewFontSize'));

            settingsModal.find('select').filter('#sourceViewTheme').change(function () {
                const selectedTheme = $(this).val();
                app.browserStorage.put('pref:sourceViewTheme', selectedTheme);
                app.reRender();
            }).val(app.browserStorage.get('pref:sourceViewTheme'));

            this._dialogContainer.append(settingsModal);
            this._modalContainer = settingsModal;
        },
    });

export default SettingsDialog;
