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

package org.ballerinalang.composer.service.workspace.launcher;

import com.google.gson.Gson;
import io.netty.channel.Channel;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.apache.commons.io.IOUtils;
import org.ballerinalang.composer.service.workspace.launcher.dto.CommandDTO;
import org.ballerinalang.composer.service.workspace.launcher.dto.MessageDTO;
import org.ballerinalang.composer.service.workspace.launcher.util.LaunchUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;

/**
 * Launch Manager which manage launch requests from the clients.
 */
public class LaunchManager {

    private static final Logger logger = LoggerFactory.getLogger(LaunchManager.class);

    private static LaunchManager launchManagerInstance;

    private LaunchServer launchServer;

    private LaunchSession launchSession;

    private Command command;

    private String startedServiceURL;

    /**
     * Instantiates a new Debug manager.
     */
    protected LaunchManager() {

    }

    /**
     * Launch manager singleton
     *
     * @return LaunchManager instance
     */
    public static LaunchManager getInstance() {
        synchronized (LaunchManager.class) {
            if (launchManagerInstance == null) {
                launchManagerInstance = new LaunchManager();
            }
        }
        return launchManagerInstance;
    }


    public void init(int port, String startedServiceURL) {
        // start the debug server if it is not started yet.
        if (this.launchServer == null) {
            this.launchServer = new LaunchServer(port);
            this.launchServer.startServer();
        }

        // set URL to invoke the started service.
        this.startedServiceURL = startedServiceURL;
    }

    private void run(Command command) {
        Process program = null;
        this.command = command;
        // send a message if ballerina home is not set
        if (null == System.getProperty("ballerina.home") || System.getProperty("ballerina.home").isEmpty()) {
            pushMessageToClient(launchSession, LauncherConstants.ERROR, LauncherConstants.ERROR, LauncherConstants
                    .INVALID_BAL_PATH_MESSAGE);
            pushMessageToClient(launchSession, LauncherConstants.ERROR, LauncherConstants.ERROR, LauncherConstants
                    .SET_BAL_PATH_MESSAGE);
            return;
        }

        try {
            String cmd = command.toString();
            if (command.getPackageDir() == null) {
                program = Runtime.getRuntime().exec(cmd);
            } else {
                program = Runtime.getRuntime().exec(cmd, null, new File(command.getPackageDir()));
            }

            command.setProgram(program);


            if (command.getType() == LauncherConstants.ProgramType.RUN) {
                pushMessageToClient(launchSession, LauncherConstants.EXECUTION_STARTED, LauncherConstants.INFO,
                        String.format(LauncherConstants.RUN_MESSAGE, command.getFileName()));
            } else {
                pushMessageToClient(launchSession, LauncherConstants.EXECUTION_STARTED, LauncherConstants.INFO,
                        String.format(LauncherConstants.SERVICE_MESSAGE, command.getFileName()));
            }

            if (command.isDebug()) {
                MessageDTO debugMessage = new MessageDTO();
                debugMessage.setCode(LauncherConstants.DEBUG);
                debugMessage.setPort(command.getPort());
                pushMessageToClient(launchSession, debugMessage);
            }

            // start a new thread to stream command output.
            Runnable output = new Runnable() {
                public void run() {
                    LaunchManager.this.streamOutput();
                }
            };
            (new Thread(output)).start();
            Runnable error = new Runnable() {
                public void run() {
                    LaunchManager.this.streamError();
                }
            };
            (new Thread(error)).start();

        } catch (IOException e) {
            pushMessageToClient(launchSession, LauncherConstants.EXIT, LauncherConstants.ERROR, e.getMessage());
        }
    }

    public void streamOutput() {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(this.command.getProgram().getInputStream(), Charset
                    .defaultCharset()));
            String line = "";
            while ((line = reader.readLine()) != null) {
                // improve "server connector started" log message to have the service URL in it.
                if (LauncherConstants.SERVER_CONNECTOR_STARTED_AT_HTTP_DEFAULT_PORT_LOG.equals(line)
                        && startedServiceURL != null) {
                    line = LauncherConstants.SERVER_CONNECTOR_STARTED_LOG + " " + startedServiceURL;
                }
                pushMessageToClient(launchSession, LauncherConstants.OUTPUT, LauncherConstants.DATA, line);
            }
            pushMessageToClient(launchSession, LauncherConstants.EXECUTION_STOPED, LauncherConstants.INFO,
                    LauncherConstants.END_MESSAGE);
        } catch (IOException e) {
            logger.error("Error while sending output stream to client.", e);
        } finally {
            if (reader != null) {
                IOUtils.closeQuietly(reader);
            }
        }
    }

    public void streamError() {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(
                    this.command.getProgram().getErrorStream(), Charset.defaultCharset()));
            String line = "";
            while ((line = reader.readLine()) != null) {
                if (this.command.isErrorOutputEnabled()) {
                    pushMessageToClient(launchSession, LauncherConstants.OUTPUT, LauncherConstants.ERROR, line);
                }
            }
        } catch (IOException e) {
            logger.error("Error while sending error stream to client.", e);
        } finally {
            if (reader != null) {
                IOUtils.closeQuietly(reader);
            }
        }
    }

    public void stopProcess() {
        int pid = -1;
        if (this.command != null && this.command.getProgram().isAlive()) {

            String os = getOperatingSystem();
            Terminator terminator = new TerminatorFactory().getTerminator(os, this.command);

            //shutdown error streaming to prevent kill message displaying to user.
            this.command.setErrorOutputEnabled(false);
            terminator.terminate();
            pushMessageToClient(launchSession, LauncherConstants.EXECUTION_TERMINATED, LauncherConstants.INFO,
                    LauncherConstants.TERMINATE_MESSAGE);
        }
    }

    private String getOperatingSystem() {
        if (LaunchUtils.isWindows()) {
            return "windows";
        } else if (LaunchUtils.isMac() || LaunchUtils.isUnix() || LaunchUtils.isSolaris()) {
            return "unix";
        }
        return null;
    }

    public void addLaunchSession(Channel channel) {
        this.launchSession = new LaunchSession(channel);
    }

    public void processCommand(String json) {
        Gson gson = new Gson();
        CommandDTO command = gson.fromJson(json, CommandDTO.class);
        switch (command.getCommand()) {
            case LauncherConstants.RUN_PROGRAM:
                run(new Command(LauncherConstants.ProgramType.RUN, command.getFileName(), command.getFilePath(),
                        command.getCommandArgs(), false));
                break;
            case LauncherConstants.RUN_SERVICE:
                run(new Command(LauncherConstants.ProgramType.SERVICE, command.getFileName(), command.getFilePath(),
                        false));
                break;
            case LauncherConstants.DEBUG_PROGRAM:
                run(new Command(LauncherConstants.ProgramType.RUN, command.getFileName(), command.getFilePath(),
                        command.getCommandArgs(), true));
                break;
            case LauncherConstants.DEBUG_SERVICE:
                run(new Command(LauncherConstants.ProgramType.SERVICE, command.getFileName(), command.getFilePath(),
                        true));
                break;
            case LauncherConstants.TERMINATE:
                stopProcess();
                break;
            default:
                MessageDTO message = new MessageDTO();
                message.setCode(LauncherConstants.INVALID_CMD);
                message.setMessage(LauncherConstants.MSG_INVALID);
                launchServer.pushMessageToClient(launchSession, message);
        }
    }

    /**
     * Push message to client.
     *
     * @param session the debug session
     * @param status  the status
     */
    public void pushMessageToClient(LaunchSession session, MessageDTO status) {
        Gson gson = new Gson();
        String json = gson.toJson(status);
        session.getChannel().write(new TextWebSocketFrame(json));
        session.getChannel().flush();
    }

    public void pushMessageToClient(LaunchSession session, String code, String type, String text) {
        MessageDTO message = new MessageDTO();
        message.setCode(code);
        message.setType(type);
        message.setMessage(text);
        pushMessageToClient(session, message);
    }
}
