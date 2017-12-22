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

import { PLUGIN_ID as LAYOUT_MANAGER_PLUGIN_ID } from './core/layout/constants';
import { PLUGIN_ID as ALERT_PLUGIN_ID } from './core/alert/constants';
import XacmlPlugin from './plugins/xacml-editor/plugin';
import WelcomeTabPlugin from './plugins/welcome-tab/plugin';
import HelpPlugin from './plugins/help/plugin';

import { WELCOME_TAB_PLUGIN_ID } from './plugins/welcome-tab/constants';
import { PLUGIN_ID } from './plugins/help/constants';
import { PLUGIN_ID as BALLERINA_PLUGIN_ID } from './plugins/ballerina/constants';

export default {
    app: {
        plugins: [
            XacmlPlugin,
            WelcomeTabPlugin,
            HelpPlugin,
        ],
    },
    // provide plugin specific configs - if any.
    // plugin-id will be the key
    pluginConfigs: {
        [ALERT_PLUGIN_ID]: {
            container: 'alert-container',
        },
        [LAYOUT_MANAGER_PLUGIN_ID]: {
            container: 'app-container',
            dialogContainer: 'dialog-container',
        },
        [PLUGIN_ID]: {
            issue_tracker_url: 'https://github.com/ChathurangiShyalika/xacml-development-tool/issues/',
            example_url: 'http://docs.oasis-open.org/xacml/3.0/',
            api_reference_url: 'http://docs.oasis-open.org/xacml/3.0/',
        },
        [WELCOME_TAB_PLUGIN_ID]: {
            userGuide: 'http://docs.oasis-open.org/xacml/3.0/',
            recentPolicy: [
                {
                    name: 'Template 01',
                    isFile: true,
                    path: '/samples/template_01/test.xml',
                    image: 'preview_echoService',
                },
                {
                    name: 'Template 02',
                    isFile: true,
                    path: '/samples/template_02/test.xml',
                    image: 'preview_helloWorld',
                },
            ],

            samples: [
                {
                    name: 'Template 01',
                    isFile: true,
                    path: '/samples/template_01/test.xml',
                    image: 'preview_echoService',
                },
                {
                    name: 'Template 02',
                    isFile: true,
                    path: '/samples/template_02/test.xml',
                    image: 'preview_helloWorld',
                },
                {
                    name: 'Template 03',
                    isFile: false,
                    folder: '/samples/template_03',
                    path: '/samples/template_03/test.xml',
                    image: 'preview_passthroughService',
                },
                {
                    name: 'Template 04',
                    isFile: false,
                    folder: '/samples/template_04',
                    path: '/samples/template_04/test.xml',
                    image: 'preview_transformStmt',
                },
                {
                    name: 'Template 05',
                    isFile: false,
                    folder: '/samples/template_05',
                    path: '/samples/template_05/test.xml',
                    image: 'preview_servicechaining',
                },
                {
                    name: 'Template 06',
                    isFile: false,
                    folder: '/samples/template_06',
                    path: '/samples/template_06/test.xml',
                    image: 'preview_restfulService',
                },
                {
                    name: 'Template 07',
                    isFile: false,
                    folder: '/samples/template_07',
                    path: '/samples/template_07/test.xml',
                    image: 'preview_routingServices',
                },
                {
                    name: 'Template 08',
                    isFile: false,
                    folder: '/samples/template_08',
                    path: '/samples/template_08/test.xml',
                    image: 'preview_websocket',
                }],
        },
    },
};
