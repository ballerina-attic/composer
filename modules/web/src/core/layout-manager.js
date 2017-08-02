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

import GoldenLayout from 'golden-layout';
import Plugin from 'plugins/plugin';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-dark-theme.css';

/* This is the default layout of the composer third party apps can
 overise this by passing in a special config. */
const defaultLayout = {
    content: [{
        type: 'row',
        content:[{
            type: 'component',
            componentName: 'testComponent',
            componentState: { label: 'A' },
        },{
            type: 'column',
            content:[{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'B' },
            },{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'C' },
            }]
        }]
    }]
};

/**
 * LayoutManager is responsible for loading view components in to the layout.
 *
 * @class LayoutManager
 */
class LayoutManager extends Plugin {

    /**
     * Creates an instance of LayoutManager.
     * @param {Object} args layout arguments
     * @param {Object} args.layout layout arguments
     * @memberof LayoutManager
     */
    constructor(args) {
        super();
        // overide default config from passed in layout.
        const config = (args.layout !== undefined) ? args.layout : defaultLayout;

        // create the layout
        this.composerLayout = new GoldenLayout(config);
    }

    /**
     * Render layout.
     *
     * @memberof LayoutManager
     */
    render() {
        this.composerLayout.registerComponent( 'testComponent', function( container, componentState ){
            container.getElement().html( '<h2>' + componentState.label + '</h2>' );
        });

        this.composerLayout.init();
    }
}

export default LayoutManager;
