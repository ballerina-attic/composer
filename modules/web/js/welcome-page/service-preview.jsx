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

class ServicePreviewView extends React.Component {

    render() {
        var previewThumbnails = this.props.sampleConfigs.map(function(config) {
            return (<div className="col-md-3 thumbnail-wrapper" onClick={config.clickEventCallback} key={config.sampleName}>
                <div className="thumbnail">
                    <img id="previewImg" src={"images/preview_" + config.sampleName + ".png"} />
                    <div className="caption">
                        <h4>{config.sampleName}</h4>
                    </div>
                </div>
            </div>);
        });

        return (<div>{previewThumbnails}</div>);
    }

}

export default ServicePreviewView;
