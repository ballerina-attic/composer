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
import Dialog from './../../../core/view/Dialog';

/**
 * About Dialog
 * @extends React.Component
 */
class AboutDialog extends React.Component {

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            showDialog: true,
        };
        this.onDialogHide = this.onDialogHide.bind(this);
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
     * @inheritdoc
     */
    render() {
        return (
            <Dialog
                show={this.state.showDialog}
                title={
                    <div>
                        <div className='brand'>

                            <span className='appname'>XACML Development Tool</span>
                        </div>
                        <div className='version'>v0.1</div>
                    </div>
                }
                onHide={this.onDialogHide}
                className='modal-about'
                actions={
                    <div>
                        © {new Date().getFullYear()}
                        &nbsp;
                        <a
                            href='http://wso2.com/'
                            rel='noopener noreferrer'
                            target='_blank'
                        >
                            <i className='fw fw-wso2 icon' /> Inc.
                        </a>
                    </div>

                }
            >
                <p>
                    XACML (eXtensible Access Control Markup Language) is a fine grained access control language. It is
                    not a simple task to write a policy from sketch without any support. Objective of this project is to
                    develop a tool which compliance with XACML 3.0 specifications and introduce a UI based approach to
                    create XACML policies. The developed application will be easily extensible for future features which
                    will use XACML. And this will include try it capabilities and debugger capabilities for the policies
                    as well.
                    <br /><br />
                    Please use &nbsp;
                    <a
                        rel='noopener noreferrer'
                        target='_blank'
                        href='https://github.com/ChathurangiShyalika/xacml-development-tool/issues'
                    >
                        GitHub issues
                    </a>
                    &nbsp; tracker for reporting issues.
                </p>
            </Dialog>
        );
    }
}

export default AboutDialog;
