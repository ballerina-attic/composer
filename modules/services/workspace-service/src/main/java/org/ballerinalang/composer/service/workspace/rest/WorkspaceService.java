/*
 * Copyright (c) 2016, WSO2 Inc. (http://wso2.com) All Rights Reserved.
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

package org.ballerinalang.composer.service.workspace.rest;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.inject.Inject;
import org.ballerinalang.composer.service.workspace.Workspace;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.nio.charset.Charset;
import java.nio.file.AccessDeniedException;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.NotDirectoryException;
import java.nio.file.Paths;
import java.nio.file.ReadOnlyFileSystemException;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Micro-service for exposing the workspace.
 *
 * @since 0.1-SNAPSHOT
 */
@Path("/service/workspace")
public class WorkspaceService {

    private static final Logger logger = LoggerFactory.getLogger(WorkspaceService.class);
    private static final String FILE_SEPARATOR = "file.separator";
    private static final String STATUS = "status";
    private static final String SUCCESS = "success";
    private static final String CONTENT = "content";

    private List<java.nio.file.Path> rootPaths;

    @Inject
    private Workspace workspace;

    @GET
    @Path("/root")
    @Produces("application/json")
    public Response root() {
        try {
            JsonArray roots = (rootPaths == null || rootPaths.isEmpty()) ? workspace.listRoots() :
                    workspace.getRoots(rootPaths);
            return Response.status(Response.Status.OK)
                    .entity(roots)
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/root service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/list")
    @Produces("application/json")
    public Response directoriesInPath(@QueryParam("path") String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(workspace.listDirectoriesInPath(new String(Base64.getDecoder().decode(path),
                            Charset.defaultCharset())))
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/list service error", throwable.getMessage());
            return  getErrorResponse(throwable);
        }
    }
    
    @GET
    @Path("/exists")
    @Produces("application/json")
    public Response pathExists(@QueryParam("path") String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(workspace.exists(new String(Base64.getDecoder().decode(path), Charset.defaultCharset())))
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/exists service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/create")
    @Produces("application/json")
    public Response create(@QueryParam("path") String pathParam, @QueryParam("type") String typeParam) {
        try {
            String path = new String(Base64.getDecoder().decode(pathParam), Charset.defaultCharset()),
                   type = new String(Base64.getDecoder().decode(typeParam), Charset.defaultCharset());
            workspace.create(path, type);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/create service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/delete")
    @Produces("application/json")
    public Response delete(@QueryParam("path") String pathParam, @QueryParam("type") String typeParam) {
        try {
            String path = new String(Base64.getDecoder().decode(pathParam), Charset.defaultCharset()),
                   type = new String(Base64.getDecoder().decode(typeParam), Charset.defaultCharset());
            workspace.delete(path, type);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/delete service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }
    
    @GET
    @Path("/listFiles")
    @Produces("application/json")
    public Response filesInPath(@QueryParam("path") String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(workspace.listFilesInPath(new String(Base64.getDecoder().decode(path),
                            Charset.defaultCharset())))
                    .header("Access-Control-Allow-Origin", '*').type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/list service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/write")
    @Produces("application/json")
    public Response write(String payload) {
        try {
            String location = "";
            String configName = "";
            String config = "";
            Matcher locationMatcher = Pattern.compile("location=(.*?)&configName").matcher(payload);
            while (locationMatcher.find()) {
                location = locationMatcher.group(1);
            }
            Matcher configNameMatcher = Pattern.compile("configName=(.*?)&").matcher(payload);
            while (configNameMatcher.find()) {
                configName = configNameMatcher.group(1);
            }
            String[] splitConfigContent = payload.split("config=");
            if (splitConfigContent.length > 1) {
                config = splitConfigContent[1];
            }
            byte[] base64Config = Base64.getDecoder().decode(config);
            byte[] base64ConfigName = Base64.getDecoder().decode(configName);
            byte[] base64Location = Base64.getDecoder().decode(location);
            Files.write(Paths.get(new String(base64Location, Charset.defaultCharset()) +
                                  System.getProperty(FILE_SEPARATOR) +
                                  new String(base64ConfigName, Charset.defaultCharset())), base64Config);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*').type
                    (MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/write service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }
    
    @POST
    @Path("/read")
    @Produces("application/json")
    public Response read(String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(workspace.read(path)).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/read service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }
    
    @POST
    @Path("/log")
    @Produces("application/json")
    public Response log(@FormParam("logger") String loggerID,
                        @FormParam("timestamp") String timestamp,
                        @FormParam("level") String level,
                        @FormParam("url") String url,
                        @FormParam("message") String message,
                        @FormParam("layout") String layout) {
        try {
            workspace.log(loggerID, timestamp, level, url, message, layout);
            JsonObject entity = new JsonObject();
            entity.addProperty("status", "success");
            return Response.status(Response.Status.OK)
                    .entity(entity)
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/log service error", throwable.getMessage());
            return getErrorResponse(throwable);
        }
    }

    public Workspace getWorkspace() {
        return this.workspace;
    }

    private Response getErrorResponse(Throwable ex) {
        JsonObject entity = new JsonObject();
        String errMsg = ex.getMessage();
        if (ex instanceof AccessDeniedException) {
            errMsg = "Access Denied to " + ex.getMessage();
        } else if (ex instanceof NoSuchFileException) {
            errMsg = "No such file: " + ex.getMessage();
        } else if (ex instanceof FileAlreadyExistsException) {
            errMsg = "File already exists: " + ex.getMessage();
        } else if (ex instanceof NotDirectoryException) {
            errMsg = "Not a directory: " + ex.getMessage();
        } else if (ex instanceof ReadOnlyFileSystemException) {
            errMsg = "Read only: " + ex.getMessage();
        } else if (ex instanceof DirectoryNotEmptyException) {
            errMsg = "Directory not empty: " + ex.getMessage();
        } else if (ex instanceof FileNotFoundException) {
            errMsg = "File not found: " + ex.getMessage();
        }
        entity.addProperty("Error", errMsg);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(entity)
                .header("Access-Control-Allow-Origin", '*')
                .type(MediaType.APPLICATION_JSON)
                .build();
    }

    public List<java.nio.file.Path> getRootPaths() {
        return rootPaths;
    }

    public void setRootPaths(List<java.nio.file.Path> rootPaths) {
        this.rootPaths = rootPaths;
    }
}
