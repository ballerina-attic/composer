/*
 * Copyright (c) 2017, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.ballerinalang.composer.service.workspace.swagger;

import org.ballerinalang.services.dispatchers.http.Constants;

/**
 * This class will hold all constants related to swagger ballerina conversion.
 */
public class SwaggerBallerinaConstants {
    public static final String RESOURCE_UUID_NAME = "x-UniqueResourceKey";
    public static final String VARIABLE_UUID_NAME = "x-UniqueVariableKey";
    public static final  String HTTP_PACKAGE_PREFIX = "http:";
    public static final String HTTP_VERB_MATCHING_PATTERN = "(?i)|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_GET + "|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_PUT + "|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_POST + "|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_DELETE + "|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_OPTIONS + "|" +
            HTTP_PACKAGE_PREFIX + Constants.ANNOTATION_METHOD_PATCH + "|" +
            "http:HEAD";
}
