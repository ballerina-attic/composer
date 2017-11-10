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

package org.ballerinalang.composer.service.workspace.langserver2.transport.ws.server;

import javax.websocket.CloseReason;
import javax.websocket.Session;

/**
 * Ballerina Language Server Websocket interface
 */
public interface BLangWSServer {

    /**
     * Handle the websocket connection open
     * @param session {@link Session} - client session
     */
    void onOpen(Session session);

    /**
     * Handle the received text message
     * @param text {@link String} - text message
     * @param session {@link Session} - client session
     */
    void onTextMessage(String text, Session session);

    /**
     * Handle the connection close
     * @param closeReason {@link CloseReason} - close reason instance
     * @param session {@link Session} - client session
     */
    void onClose(CloseReason closeReason, Session session);

    /**
     * Handle the on error
     * @param throwable {@link Throwable}
     */
    void onError(Throwable throwable);
}
