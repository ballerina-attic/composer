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
package org.ballerinalang.composer.service.workspace.langserver2.transport.ws.server.impl;

import org.ballerinalang.composer.service.workspace.langserver2.transport.ws.server.BLangWSServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * {@code BLangWSServer} Ballerina Language Server Websocket implementation
 *
 * @since 0.96
 */
@ServerEndpoint("/blangserver")
public class BLangWSServerImpl implements BLangWSServer {
    private static final Logger LOGGER = LoggerFactory.getLogger(BLangWSServerImpl.class);
    /* Stores all the active sessions in a list */
    private List<Session> sessions;

    public BLangWSServerImpl(List<Session> sessions) {
        this.sessions = sessions;
    }

    @OnOpen
    public void onOpen(Session session) {
        LOGGER.debug("Client Connected : [" + session.getId() + "]");
        this.addSession(session);
    }

    @OnMessage
    public void onTextMessage(String text, Session session) {
        LOGGER.debug("Client Message Received : [" + session.getId() + "]");
    }

    @OnClose
    public void onClose(CloseReason closeReason, Session session) {
        LOGGER.debug("Connection Closed with Status Code : " + closeReason.getCloseCode().getCode()
                + " On reason " + closeReason.getReasonPhrase());
        this.removeSession(session);
    }

    @OnError
    public void onError(Throwable throwable) {
        LOGGER.error("Error found in method : " + throwable.toString());
    }

    /**
     * Add new client session to the sessions list
     * @param session - client session
     */
    public void addSession(Session session) {
        this.sessions.add(session);
    }

    /**
     * Remove the session from the sessions list
     * @param session - client session to remove
     */
    public void removeSession(Session session) {
        this.sessions.remove(session);
    }
}
