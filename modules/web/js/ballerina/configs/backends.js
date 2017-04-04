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

        export default  {
            services:   {
                workspace:  {
                    endpoint: "http://localhost:8289/service/workspace"
                },
                packages:  {
                    endpoint: "http://localhost:8289/ballerina/editor/packages"
                },
                swagger:  {
                    endpoint: "http://localhost:8289/service/swagger/"
                },
                parser:  {
                    endpoint: "http://localhost:8289/ballerina/model/content"
                },
                validator:  {
                    endpoint: "http://localhost:8289/ballerina/validate"
                }
            }
        };
    

