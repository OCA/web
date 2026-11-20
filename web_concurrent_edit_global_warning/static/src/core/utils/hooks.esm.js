/** @odoo-module **/
// Copyright 2026 Akretion (http://www.akretion.com).
// @author Florian Mounier <florian.mounier@akretion.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {useComponent, useEffect} from "@odoo/owl";
import legacySession from "web.session";

export function useWebsocketBroadcastChannel(onmessage, onconnect, options = {}) {
    const component = useComponent();
    component._current_bc_ws = null;
    const queue = [];
    let timeoutId = null;
    let retryCount = 0;

    useEffect(
        () => {
            const connect = () => {
                component._current_bc_ws = new WebSocket(
                    `${legacySession.prefix.replace(
                        "http",
                        "ws"
                    )}/websocket/broadcast_channel`
                );
                component._current_bc_ws.onopen = () => {
                    if (options.debug) {
                        console.log(
                            `Websocket broadcast channel ${component._current_bc_ws.url} opened`
                        );
                        onconnect.bind(component)();
                    }
                    retryCount = 0;
                    queue.forEach((message) => {
                        if (options.debug) {
                            console.log(
                                `Sending queued message on websocket broadcast channel:`,
                                message
                            );
                        }
                        component._current_bc_ws.send(message);
                    });
                    queue.length = 0;
                };
                component._current_bc_ws.onclose = () => {
                    if (component._current_bc_ws) {
                        if (options.debug) {
                            console.log(
                                `Websocket broadcast lost connection, trying to reconnect in one second...`
                            );
                        }
                        if (!timeoutId) {
                            timeoutId = setTimeout(() => {
                                retryCount++;
                                connect();
                                timeoutId = null;
                            }, 1000);
                        }
                    } else if (options.debug) {
                        console.trace();
                        console.log(`Websocket broadcast channel closed`);
                    }
                };

                component._current_bc_ws.onmessage = (evt) => {
                    if (options.debug) {
                        console.log(
                            `Received message on websocket broadcast channel:`,
                            evt.data
                        );
                    }
                    onmessage.bind(component)(JSON.parse(evt.data));
                };
                component._current_bc_ws.onerror = (error) => {
                    if (options.debug) {
                        console.error(`Error on websocket broadcast channel:`, error);
                    }
                    try {
                        component._current_bc_ws.close();
                    } catch (closeError) {
                        console.error(
                            `Error closing websocket broadcast channel:`,
                            closeError
                        );
                    }
                    console.log(
                        `Reconnecting websocket broadcast channel in ${
                            5 + retryCount
                        }s...`
                    );
                    if (!timeoutId) {
                        timeoutId = setTimeout(() => {
                            retryCount++;
                            connect();
                            timeoutId = null;
                        }, 5000 + retryCount * 1000);
                    }
                };
            };

            if (!component._current_bc_ws) {
                if (options.debug) {
                    console.log("Initializing websocket broadcast channel");
                }
                connect();
            }
            return () => {
                if (options.debug) {
                    console.log(`Closing websocket broadcast channel`);
                }
                clearTimeout(timeoutId);
                timeoutId = null;
                component._current_bc_ws.close();
                component._current_bc_ws = null;
                queue.length = 0;
            };
        },
        () => []
    );
    const postMessage = (message) => {
        if (component._current_bc_ws) {
            if (options.debug) {
                console.log(`Posting message on websocket broadcast channel:`, message);
            }
            if (component._current_bc_ws.readyState === WebSocket.OPEN) {
                component._current_bc_ws.send(JSON.stringify(message));
            } else if (component._current_bc_ws.readyState === WebSocket.CONNECTING) {
                if (options.debug) {
                    console.warn(
                        `Cannot post message, websocket broadcast channel is not open, queueing message`
                    );
                }
                queue.push(JSON.stringify(message));
            } else {
                if (options.debug) {
                    console.warn(
                        `Cannot post message, websocket broadcast channel is
                        ${
                            component._current_bc_ws.readyState === WebSocket.CLOSED
                                ? "closed"
                                : "closing"
                        }`
                    );
                }
                queue.push(JSON.stringify(message));
            }
        } else if (options.debug) {
            console.warn(
                `Cannot post message, websocket broadcast channel is not initialized`
            );
        }
    };
    return {postMessage};
}
