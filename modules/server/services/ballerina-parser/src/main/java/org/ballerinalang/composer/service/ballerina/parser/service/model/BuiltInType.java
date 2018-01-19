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

package org.ballerinalang.composer.service.ballerina.parser.service.model;

/**
 * Builtin type constants.
 */
public class BuiltInType {
    public static final String INT = "int";
    public static final String FLOAT = "float";
    public static final String BOOLEAN = "boolean";
    public static final String STRING = "string";

    public static final String INT_DEFAULT = "0";
    public static final String FLOAT_DEFAULT = "0.0";
    public static final String BOOLEAN_DEFAULT = "false";
    public static final String STRING_DEFAULT = "";
    public static final String NULL_DEFAULT = "null";

    public static final String INVALID_TYPE = "><";
}
