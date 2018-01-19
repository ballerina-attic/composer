/*
*  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing,
*  software distributed under the License is distributed on an
*  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*  KIND, either express or implied.  See the License for the
*  specific language governing permissions and limitations
*  under the License.
*/

package org.ballerinalang.composer.service.tryit.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Base class for a try client.
 */
public abstract class TryItClient {
    private JsonParser parser;
    protected JsonObject clientArgs;
    protected String serviceUrl;
    
    /**
     * Initializes a try it client.
     *
     * @param serviceUrl The service url. Example hostname:port.
     * @param clientArgs client args
     */
    protected TryItClient(String serviceUrl, String clientArgs) {
        this.parser = new JsonParser();
        this.clientArgs = this.parser.parse(clientArgs).getAsJsonObject();
        this.serviceUrl = serviceUrl;
    }
    
    /**
     * Executing the ballerina service.
     *
     * @return The response of the service.
     * @throws TryItException Error when invoking the service.
     */
    public abstract String execute() throws TryItException;
}
