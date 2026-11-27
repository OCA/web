*   No known issues.
*   **Data Optimization**: Notification payloads compressed using `zlib` and encoded in `base64`. (Discarded for now: Tested but with thousands of messages it generated too many `blob:...` threads in the client browser, making it unable to manage all messages).
*   **Permission Revocation Handling**: Currently, if a client loses permission to a record they are already subscribed to, they might continue receiving updates. It would be beneficial to find a server-side mechanism to force-unsubscribe a client from a specific channel when their permissions change.
