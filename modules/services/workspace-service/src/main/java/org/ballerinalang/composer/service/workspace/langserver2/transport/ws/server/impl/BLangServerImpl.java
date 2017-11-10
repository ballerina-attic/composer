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

import org.ballerinalang.composer.service.workspace.langserver2.transport.ws.server.BLangServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import javax.websocket.Session;

/**
 * {@code BLangServerImpl} Ballerina Language Server implementation
 *
 * @since 0.96
 */
public class BLangServerImpl implements BLangServer {
    private static final Logger LOGGER = LoggerFactory.getLogger(BLangServerImpl.class);
    private BLangWSServerImpl bLangWSServer;
    private List<Session> sessions;

    public BLangServerImpl() {
        this.init();
    }

    @Override
    public void init() {
        this.sessions = new ArrayList<>();
        bLangWSServer = new BLangWSServerImpl(this.sessions);
    }

    @Override
    public boolean start() {
        return false;
    }

    @Override
    public boolean stop() {
        return false;
    }

    /**
     * Get the blang websocket server implementation instance
     * @return {@link BLangWSServerImpl}
     */
    public BLangWSServerImpl getBLangWSServer() {
        return this.bLangWSServer;
    }

    /**
     * Get the client session by Id
     * @param sessionId - session id
     * @return {@link Session}
     */
    public Session getSession(String sessionId) {
        Session clientSession = this.sessions.stream()
                .filter(session -> session.getId().equals(sessionId))
                .findFirst()
                .orElse(null);

        if (clientSession == null) {
            // Should not come to this point ideally
            LOGGER.error("Could not find Session with ID : " + sessionId);
        }

        return clientSession;
    }
}
