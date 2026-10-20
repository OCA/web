No specific configuration is required.

## Performance: UNLOGGED bus.bus table

In high-volume environments (many concurrent users, frequent CRUD operations),
the `bus.bus` table can generate significant WAL (Write-Ahead Logging) traffic.
Since `bus.bus` is **ephemeral by design** — rows are auto-vacuumed after
~100 seconds (`TIMEOUT * 2`) — the WAL overhead provides no real benefit:
after a crash or failover, stale notifications are irrelevant because clients
reconnect and re-poll from scratch.

Converting `bus.bus` to `UNLOGGED` skips WAL writes entirely, which:

- **Reduces disk I/O** on the WAL volume.
- **Speeds up INSERTs** (the most frequent operation on this table).
- **Reduces replication lag** in streaming-replica setups (unlogged tables
  are not replicated — replicas won't see bus notifications, but they don't
  need to since each Odoo worker polls its own database).

### Tradeoffs

| Aspect | Impact |
|---|---|
| Crash recovery | Table is **truncated** automatically. Clients reconnect and miss nothing meaningful. |
| Streaming replicas | Table is **empty** on replicas. Only relevant if replicas serve websocket workers (unusual). |
| `pg_basebackup` | Table structure is included but data is not. No impact on backup/restore workflows. |
| Logical replication | Unlogged tables are excluded. No impact unless bus data is replicated intentionally. |

### SQL script

Run this during a **maintenance window** (no active Odoo workers):

```sql
-- 1. Verify current state
SELECT relpersistence FROM pg_class WHERE relname = 'bus_bus';
-- 'p' = permanent (WAL), 'u' = unlogged

-- 2. Convert to UNLOGGED
ALTER TABLE bus_bus SET UNLOGGED;

-- 3. Confirm
SELECT relpersistence FROM pg_class WHERE relname = 'bus_bus';
-- Should return 'u'
```

To **revert** back to a permanent (WAL-logged) table:

```sql
ALTER TABLE bus_bus SET LOGGED;
```

### Recommendation

| Scenario | Recommendation |
|---|---|
| Single-server or active-passive HA | **Use UNLOGGED**. Safe and measurable I/O reduction. |
| Active-active with shared websockets on replica | Keep LOGGED (rare setup). |
| Development / staging | Optional — low traffic makes the difference negligible. |

> **Note**: This optimization applies to the core `bus.bus` table from the
> `bus` module. `bus_record_events` increases the notification volume by
> broadcasting CRUD events, which makes the UNLOGGED optimization more
> impactful when this module is installed.
