# Sukonoe

A Node.js WebSocket bot server for [arras.io](https://arras.io) with proxy rotation support.

## How to run

The workflow **"Start application"** runs `npm run start` (i.e. `node server.js`).

The server listens on port **8080** (set via `process.env.PORT || 8080`).

### WSS endpoint

```
wss://ebd90d64-f95c-4011-b49d-fa84d1145edc-00-2b5qpprs0xbgo.pike.replit.dev
```

## Architecture

- **server.js** — WebSocket server. Accepts connections from a controller client, verifies them with a simple XOR challenge, then forks bot worker processes on demand.
- **index.js** — Bot worker. Runs a headless arras.io game instance using the live game script and WASM, connects through an HTTP/SOCKS proxy.

## Proxy configuration

By default the server uses a built-in proxy credential hardcoded in `server.js`. To use your own proxy list instead, set the `PROXY_ROTATE_LIST` environment variable to a comma- or newline-separated list of proxy URLs.

## Dependencies

| Package | Purpose |
|---|---|
| `ws` | WebSocket server & client |
| `msgpackr` | Binary message packing |
| `node-fetch` | HTTP fetch for bot workers |
| `https-proxy-agent` | HTTP proxy support |
| `socks-proxy-agent` | SOCKS proxy support |

## User preferences

- Keep existing project structure and stack.
