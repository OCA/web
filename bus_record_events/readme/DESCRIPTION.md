This module provides an efficient and secure mechanism to notify CRUD events
(Create, Write, Unlink) in real-time via the Odoo Bus.

**Key Features:**

*   **Server Efficiency**: Uses Odoo's native `bus.bus` system to avoid table locking and minimize performance impact.
*   **Granular Security**: Implements a permission system in `ir.websocket` ensuring users can only subscribe to record or model channels for which they have read permissions (Access Rights and Record Rules).
