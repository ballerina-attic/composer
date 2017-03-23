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

import _ from 'lodash';
import LifeLine from './life-line';

/**
 * View for  the Default Worker lifeline
 * @class DefaultWorkerView
 * @constructor
 */
class DefaultWorkerView extends LifeLine {
    /**
     * @param args {object} - config
     * @param args.container {SVGGElement} - SVG group element to draw the life line
     * @param args.centerPoint {Point} - center point to draw the life line.
     * @param args.cssClass {object} - css classes for the lifeline
     * @param args.cssClass.group {string} - css class for root group
     * @param args.cssClass.title {string} - css class for the title
     * @param args.title {string} - title
     * @constructor
     */
    constructor(args) {
        _.set(args, 'title',  _.get(args, 'title', 'ResourceWorker'));
        _.set(args, 'cssClass.group',  _.get(args, 'cssClass.group', 'default-worker-life-line'));
        _.set(args, 'line.height',  _.get(args, 'line.height', 290));
        super(args);
    }
}

export default DefaultWorkerView;
