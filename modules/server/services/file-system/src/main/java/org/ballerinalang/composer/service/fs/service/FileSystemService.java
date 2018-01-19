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
package org.ballerinalang.composer.service.fs.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.ballerinalang.composer.server.core.ServerConstants;
import org.ballerinalang.composer.server.spi.ComposerService;
import org.ballerinalang.composer.server.spi.ServiceInfo;
import org.ballerinalang.composer.server.spi.ServiceType;
import org.ballerinalang.composer.service.fs.Constants;
import org.ballerinalang.composer.service.fs.FileSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.nio.file.AccessDeniedException;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.NotDirectoryException;
import java.nio.file.Paths;
import java.nio.file.ReadOnlyFileSystemException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 *  Micro service that exposes the file system to composer.
 */
@Path(ServerConstants.CONTEXT_ROOT + "/" + Constants.SERVICE_PATH)
public class FileSystemService implements ComposerService {

    private static final Logger logger = LoggerFactory.getLogger(FileSystemService.class);
    private static final String FILE_SEPARATOR = "file.separator";
    private static final String STATUS = "status";
    private static final String SUCCESS = "success";

    private List<java.nio.file.Path> rootPaths;

    private final FileSystem fileSystem;

    public FileSystemService(FileSystem fileSystem) {
        this.fileSystem = fileSystem;
    }

    @GET
    @Path("/root")
    @Produces("application/json")
    public Response root(@DefaultValue(".bal") @QueryParam("extensions") String extensions) {
        try {
            List<String> extensionList = Arrays.asList(extensions.split(","));
            JsonArray roots = (rootPaths == null || rootPaths.isEmpty()) ? fileSystem.listRoots(extensionList) :
                    fileSystem.getJsonForRoots(rootPaths, extensionList);
            return Response.status(Response.Status.OK)
                    .entity(roots)
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/root service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/exists")
    @Produces("application/json")
    public Response pathExists(@QueryParam("path") String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(fileSystem.exists(new String(Base64.getDecoder().decode(path), Charset.defaultCharset())))
                    .header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (Throwable throwable) {
            logger.error("/exists service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/create")
    @Produces("application/json")
    public Response create(@FormParam("path") String pathParam, @FormParam("type") String typeParam,
                           @FormParam("content") String contentParam) {
        try {
            String path = new String(Base64.getDecoder().decode(pathParam), Charset.defaultCharset()),
                    type = new String(Base64.getDecoder().decode(typeParam), Charset.defaultCharset()),
                    content = new String(Base64.getDecoder().decode(contentParam), Charset.defaultCharset());
            fileSystem.create(path, type, content);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/create service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/move")
    @Produces("application/json")
    public Response move(@FormParam("srcPath") String srcPath, @FormParam("destPath") String destPath) {
        try {
            String src = new String(Base64.getDecoder().decode(srcPath), Charset.defaultCharset()),
                    dest = new String(Base64.getDecoder().decode(destPath), Charset.defaultCharset());
            fileSystem.move(src, dest);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/create service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/copy")
    @Produces("application/json")
    public Response copy(@FormParam("srcPath") String srcPath, @FormParam("destPath") String destPath) {
        try {
            String src = new String(Base64.getDecoder().decode(srcPath), Charset.defaultCharset()),
                    dest = new String(Base64.getDecoder().decode(destPath), Charset.defaultCharset());
            fileSystem.copy(src, dest);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/create service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/delete")
    @Produces("application/json")
    public Response delete(@FormParam("path") String pathParam) {
        try {
            String path = new String(Base64.getDecoder().decode(pathParam), Charset.defaultCharset());
            fileSystem.delete(path);
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/delete service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/listFiles")
    @Produces("application/json")
    public Response filesInPath(@QueryParam("path") String path,
                                @DefaultValue(".bal") @QueryParam("extensions") String extensions) {
        try {
            List<String> extensionList = Arrays.asList(extensions.split(","));

            return Response.status(Response.Status.OK)
                    .entity(fileSystem.listFilesInPath(new String(Base64.getDecoder().decode(path),
                            Charset.defaultCharset()), extensionList))
                    .header("Access-Control-Allow-Origin", '*').type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/list service error", throwable.getMessage(), throwable);
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
            String isImageFile = "";
            Matcher locationMatcher = Pattern.compile("location=(.*?)&configName").matcher(payload);
            while (locationMatcher.find()) {
                location = locationMatcher.group(1);
            }
            Matcher configNameMatcher = Pattern.compile("configName=(.*?)&").matcher(payload);
            while (configNameMatcher.find()) {
                configName = configNameMatcher.group(1);
            }
            Matcher isImageFileMatcher = Pattern.compile("imageFile=(.*?)&config").matcher(payload);
            while (isImageFileMatcher.find()) {
                isImageFile = isImageFileMatcher.group(1);
            }
            String[] splitConfigContent = payload.split("config=");
            if (splitConfigContent.length > 1) {
                config = splitConfigContent[1];
            }

            byte[] base64ConfigName = Base64.getDecoder().decode(configName);
            byte[] base64Location = Base64.getDecoder().decode(location);
            byte[] configDecoded = URLDecoder.decode(config, "UTF-8").getBytes("UTF-8");
            if (isImageFile.equals("true")) {
                byte[] base64Decoded = Base64.getDecoder().decode(configDecoded);
                Files.write(Paths.get(new String(base64Location, Charset.defaultCharset()) +
                                System.getProperty(FILE_SEPARATOR) +
                                new String(base64ConfigName, Charset.defaultCharset())),
                        base64Decoded);
            } else {
                Files.write(Paths.get(new String(base64Location, Charset.defaultCharset()) +
                                System.getProperty(FILE_SEPARATOR) +
                                new String(base64ConfigName, Charset.defaultCharset())),
                        configDecoded);
            }
            JsonObject entity = new JsonObject();
            entity.addProperty(STATUS, SUCCESS);
            return Response.status(Response.Status.OK).entity(entity).header("Access-Control-Allow-Origin", '*').type
                    (MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/write service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @POST
    @Path("/read")
    @Produces("application/json")
    public Response read(String path) {
        try {
            return Response.status(Response.Status.OK)
                    .entity(fileSystem.read(path)).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/read service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
    }

    @GET
    @Path("/userHome")
    @Produces("text/plain")
    public Response userHome() {
        try {
            return Response.status(Response.Status.OK)
                    .entity(fileSystem.getUserHome()).header("Access-Control-Allow-Origin", '*')
                    .type(MediaType.APPLICATION_JSON).build();
        } catch (Throwable throwable) {
            logger.error("/userHome service error", throwable.getMessage(), throwable);
            return getErrorResponse(throwable);
        }
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

    @Override
    public ServiceInfo getServiceInfo() {
        return new ServiceInfo(Constants.SERVICE_NAME, Constants.SERVICE_PATH, ServiceType.HTTP);
    }
}
