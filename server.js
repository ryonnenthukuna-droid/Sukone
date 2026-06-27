(async () => {
    const { fork } = await import("child_process");
    const { WebSocketServer } = await import("ws");
    const { pack, unpack } = await import("msgpackr");
    const http = await import("http");

    const prod = false;
    let PROXIES = [];
    let proxyIdx = 0;
    const BUILTIN_PROXY_LIST = [
        "http://rotating:IFQFJuicg3vxVEqK@dc0f.redscrape.com:7777"
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
        console.log("Fetching anonymous HTTP proxies from ProxyScrape...");
        try {
            const proxyRes = await fetch("https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=20000&country=all&ssl=all&anonymity=anonymous");
            const proxyText = await proxyRes.text();
            
            // Parse the text, remove empty lines, and format as URLs
            PROXIES.push(...proxyText
                .split(/\r?\n/)
                .filter(p => p.trim() !== "")
                .map(p => `http://${p.trim()}`));
                
            console.log(`Successfully loaded ${PROXIES.length} proxies.`);
        } catch (err) {
            console.error("Failed to fetch proxies. Check your network or API endpoint:", err);
        }
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

        function close() {
            ws.close();
            for (const worker of workers) {
                sendToWorker(worker, { type: "destroy" });
            }
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
                                name: `[Iya] ${nameSeq}`,
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
                        if (verified) {
                            for (const worker of workers) {
                                worker.send({ type: "destroy" });
                            }
                            workers = [];
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
            for (const worker of workers) {
                sendToWorker(worker, { type: "destroy" });
            }

            console.log(addr, "disconnected");
        });
    });

    const port = prod ? process.env.PORT : 8082;
    server.listen(port, () => {
        console.log("Server listening on port", port);
    });
})();