Patient Progress Network Notes

This file documents the local Wi-Fi discovery and PIN join flow used by RehabApp.

- UDP discovery: port 41234, broadcasts `workspace-query:<name>` and expects a JSON `workspace-claim` response.
- Workspace claim payload includes: `{ type:'workspace-claim', name, host, port, requiresPin }`.
- Socket.io server runs on port 3001 by default and enforces a PIN if the server was started with one.
- Staff devices must emit `auth:join` with `{ pin }` after socket connect; server replies `auth:ok` or `auth:failed`.

Quick start (Admin host):

1. Start the app as Admin.
2. Click Connect → enter Workspace name.
3. If no existing workspace is found, Admin is prompted to create workspace and optionally set a PIN.

Quick start (Staff join):

1. Click Connect → enter Workspace name.
2. If workspace requires a PIN, you will be prompted to enter it.
3. On successful auth, the client receives real-time updates for progress notes.

Security note: PIN is a simple shared secret. For production, use TLS and stronger auth methods.
