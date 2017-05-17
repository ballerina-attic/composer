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
package org.ballerinalang.composer.service.workspace;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

/**
 * Interface for the workspace.
 */
public interface Workspace {
    
    JsonArray listRoots() throws IOException;

    JsonArray getRoots(List<Path> rootPaths) throws IOException;
    
    JsonArray listDirectoriesInPath(String path) throws IOException;
    
    JsonArray listFilesInPath(String path) throws IOException;
    
    JsonObject exists(String path) throws IOException;
    
    void create(String path, String type) throws IOException;
    
    void delete(String path, String type) throws IOException;
    
    void write(String path, String content) throws IOException;
    
    JsonObject read(String path) throws IOException;
    
    void log(String logger, String timestamp, String level, String url, String message, String layout) throws
            IOException;
}
