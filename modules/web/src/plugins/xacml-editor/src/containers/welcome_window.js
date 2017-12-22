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
import Pre_policies from '../components/pre_policies';
import Welcome_samples from '../components/welcome_samples';
import { Tabs, Tab } from 'react-bootstrap';

/**
 * Welcome Window
 */

class welcome_window extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 1,
        };
        this.handleSelect = this.handleSelect.bind(this);
    }
    handleSelect(key) {
        this.setState({ key });
    }

    render() {
        return (
            <div>
                <div className='container-fluid'>
                    <div className='row no-gutters'>
                        <div className='col-lg-2'>
                            <center>
                                <div />
                                <br />
                                <div>
                                    <button id='open_file_button' type='button' className='btn btn-warning'><i className='fw fw-folder-open fw-2x' />&nbsp;&nbsp;Open File
                                    </button>
                                </div>
                                <br />
                                <div>
                                    <button id='open_directory_button' type='button' className='btn btn-warning'><i className='fw fw-folder fw-2x' />&nbsp;&nbsp;Open Directory
                                    </button>
                                </div>
                            </center>
                        </div>

                        <div className='mycontent-left'>
                            <div className='col-lg-1' />
                        </div>
                        <div className='col-lg-1' />

                        <div className='col-lg-6'>
                            <center><h3>Recent Policies</h3></center>
                            <div>
                                <Pre_policies />
                            </div>

                            <center><h3>Try out our samples</h3></center>
                            <Welcome_samples />

                            <center><h3>Get Help</h3></center>
                            <div className='jumbotron'>
                                <ul>
                                    <li><a href='#'>Questions</a></li>
                                    <li><a href='#'>Tutorials</a></li>
                                    <li><a href='#'>Support</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default welcome_window;

