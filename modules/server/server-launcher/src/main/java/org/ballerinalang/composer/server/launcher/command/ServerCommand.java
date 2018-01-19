/*
 * Copyright (c) 2018, WSO2 Inc. (http://wso2.com) All Rights Reserved.
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
package org.ballerinalang.composer.server.launcher.command;

import com.beust.jcommander.Parameter;

/**
 * Represents command line Args supported in composer server launcher.
 */
public class ServerCommand {
    @Parameter(names = {"--help", "-h", "help"}, hidden = true, help = true)
    public boolean helpFlag = false;

    @Parameter(names = {"--port" , "-p"}, description = "Specify a custom port for the server to start.")
    public Integer port;

    @Parameter(names = "--host", description = "Specify a custom interface to bind the server.")
    public String host;

    @Parameter(names = "--publicPath", description = "Specify a custom path to server the public content from.")
    public String publicPath;

    @Parameter(names = "--debug", hidden = true)
    private String debugPort;
}
