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
import Container from '../drag_drop/Container';
import Sample_policy_1 from '../drag_drop/Sample_policy_1';
/**
 * XML View of xacml policy
 */
class xml_view extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showXmlView: true,
            showDesignView: false,
            showDesignButton: true,
        };
        this.showDesignView = this.showDesignView.bind(this);
    }

    showDesignView() {
        this.setState({
            showXmlView: false,
            showDesignView: true,
            showDesignButton: false,
        });
    }

    render() {
        return (
            <div className='container-fluid'>
                <div style={{ overflow: 'hidden', clear: 'both' }}>
                    {this.state.showXmlView ?
                        <Sample_policy_1 />
                        : ''}
                    {this.state.showDesignButton ?
                        <button
                            id='open_file_button'
                            type='button'
                            onClick={this.showDesignView}
                            className='btn btn-warning pull-right'
                        ><i
                            className='fw fw-design-view fw-2x'
                        />&nbsp;&nbsp;Design View
                        </button>
                        : ''}
                    {this.state.showDesignView ?
                        <Container /> :
                        ''}

                </div>
            </div>


        );
    }


}

export default xml_view;
