(async () => {
    const { fork } = await import("child_process");
    const { WebSocketServer } = await import("ws");
    const { pack, unpack } = await import("msgpackr");
    const http = await import("http");

    const prod = false;
    let PROXIES = [];
    let proxyIdx = 0;
    const BUILTIN_PROXY_LIST = [
        "http://spjkufyo3c:bc9QQa_elQYmp63qg5@dc.decodo.com:10000/"
    ];

    function parseProxyList(list) {
        return list
            .split(/[,\n\r]+/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => p.replace(/^(http:\/\/|https:\/\/)?/, 'http://'));
    }

    function getNextProxy() {
        if (PROXIES.length === 0) {
            return null;
        }
        if (proxyIdx >= PROXIES.length) {
            proxyIdx = 0;
        }
        const proxy = PROXIES[proxyIdx];
        proxyIdx = (proxyIdx + 1) % PROXIES.length;
        return proxy;
    }

    if (process.env.PROXY_ROTATE_LIST) {
        PROXIES = parseProxyList(process.env.PROXY_ROTATE_LIST);
        console.log(`Using proxy list from PROXY_ROTATE_LIST (${PROXIES.length} proxies).`);
    } else {
        PROXIES = BUILTIN_PROXY_LIST.slice();
        console.log("Using built-in proxy list with rotation support.");
        console.log("Using configured proxy:", PROXIES[0]);
    }

    // HTTP SERVER
    const server = http.createServer((req, res) => {
        res.writeHead(426, {"Content-Type": "text/plain"});
        res.end("pluh");
    });

    // WS SERVER
    function randint(a, b) {
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    function clearTerminal() {
        if (process.stdout.isTTY) {
            process.stdout.write('\x1Bc');
            process.stdout.write('\x1B[2J');
            process.stdout.write('\x1B[H');
        }
    }

    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const addr = req.socket.remoteAddress
        console.log(addr, "connected");

        let workers = [];
        let challenge;
        let verified = false;
        let nameSeq = 1;

        let tank = "Auto-6";
        let tanks = [];
        let tankIdx = 0;

        function sendToWorker(worker, msg) {
            try {
                if (worker && worker.connected) {
                    worker.send(msg);
                }
            } catch (e) {
                console.error('Failed to send to worker:', e);
            }
        }

        function removeWorker(dead) {
            workers = workers.filter(w => w !== dead && w.connected);
        }

        function packet(...args) {
            ws.send(pack(args));
        }

        function destroyWorkers() {
            for (const worker of workers) {
                sendToWorker(worker, { type: "destroy" });
            }
            workers = [];
        }

        function close() {
            ws.close();
            destroyWorkers();
        }

        ws.on("message", (msg) => {
            try {
                const data = unpack(msg);
                const type = data.shift();

                switch (type) {
                    case "M":
                        if (challenge || data[0] != 72011) {
                            close();
                        }

                        challenge = randint(0b1000000000, 0b1111111111);
                        packet("M", challenge);
                        break;
                        
                    case "C":
                        if (data[0] == (challenge ^ 845)) {
                            verified = true;
                            console.log(addr, "verified");
                        } else {
                            close();
                            console.log(addr, "true noob")
                        }

                        break;

                    case "Z":
                        tank = data[0];
                        if (tank instanceof Array) {
                            tanks = tank;
                            tankIdx = 0;

                            for (const worker of workers) {
                                tank = tanks[tankIdx];
                                sendToWorker(worker, { type: "tankselect", tank });

                                tankIdx++;
                                if (tankIdx >= tanks.length) {
                                    tankIdx = 0;
                                }
                            }
                        } else {
                            tanks = [];
                            for (const worker of workers) {
                                sendToWorker(worker, { type: "tankselect", tank })
                            }
                        }

                        break;

                    case "F":
                        if (verified) {
                            const proxyUrl = getNextProxy();
                            if (!proxyUrl) {
                                console.log("Cannot deploy: No proxies loaded.");
                                break;
                            }

                            console.log("connecting with proxy", proxyUrl)

                            const worker = fork("index.js", []);
                            workers.push(worker);

                            // clean up worker list when it exits or errors
                            worker.on('exit', (code, signal) => {
                                console.log('worker exited', code, signal);
                                removeWorker(worker);
                            });
                            worker.on('error', (err) => {
                                console.error('worker error', err);
                                removeWorker(worker);
                            });

                            if (tanks.length) {
                                sendToWorker(worker, { type: "tankselect", tank: tanks[tankIdx] });
                                tankIdx++;
                                if (tankIdx >= tanks.length) {
                                    tankIdx = 0;
                                }
                            } else {
                                sendToWorker(worker, { type: "tankselect", tank });
                            }

                            sendToWorker(worker, { type: "start", config: {
                                id: 0,
                                proxy: {
                                    type: "http",
                                    url: proxyUrl
                                },
                                hash: "#" + data[0],
                                name: `[bot] ${nameSeq}`,
                                stats: [0, 0, 0, 0, 0, 0, 0, 9],
                                type: "follow",
                                token: "follow-8fe6ca",
                                autoFire: false,
                                autoRespawn: true,
                                keys: [],
                                keysHold: [],
                                tank: "Auto4",
                                chatSpam: "",
                                squadId: data[0],
                                reconnectAttempts: 3,
                                reconnectDelay: 15000,
                            }});
                            nameSeq++;

                            proxyIdx++;
                        }

                        break;

                    case "B":
                    case "destroy":
                    case "D":
                        if (verified || type === "destroy" || type === "D") {
                            clearTerminal();
                            console.log(addr, "received destroy from controller");
                            destroyWorkers();
                        }

                        break;
                        
                    case "A":
                        if (verified) {
                            for (const worker of workers) {
                                worker.send({
                                    type: "position",
                                    x: data[0],
                                    y: data[1],
                                    mouseX: data[2],
                                    mouseY: data[3],
                                    mouseDown: data[4],
                                    rMouseDown: data[5],
                                    mouse: data[6],
                                    feeding: data[7],
                                    shift: data[8]
                                });
                            }
                        }
                        break;
                
                    default:
                        close();
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on("close", () => {
            destroyWorkers();
            console.log(addr, "disconnected");
        });
    });

    const port = prod ? process.env.PORT : 8082;
    server.listen(port, () => {
        console.log("Server listening on port", port);
    });
})();
