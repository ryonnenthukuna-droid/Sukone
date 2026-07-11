(async () => {
    'use strict';

    if (!window.WebAssembly) {
        return;
    }

    const harras_heap = [null, Function];

    function harras_assign(index, value) {
        harras_heap[index] = value;
    }

    let harras_cache_u8 = null;
    function get_harras_u8() {
        if (!harras_cache_u8 || harras_cache_u8.byteLength === 0) {
            harras_cache_u8 = new Uint8Array(harras_exports.g.buffer);
        }
        return harras_cache_u8;
    }

    let harras_cache_i32 = null;
    function get_harras_i32() {
        if (!harras_cache_i32 || harras_cache_i32.byteLength === 0) {
            harras_cache_i32 = new Int32Array(harras_exports.g.buffer);
        }
        return harras_cache_i32;
    }

    let harras_cache_f64 = null;
    const harras_encoder = new TextEncoder("utf-8");
    const harras_decoder = new TextDecoder("utf-8", { ignoreBOM: true });

    harras_decoder.decode();

    const harras_ascii_check = /^[\x00-\x7f]*$/;

    function harras_write_bytes(address, byte_array) {
        const memory_offset = harras_exports.c(byte_array.length, 1);
        get_harras_u8().set(byte_array, memory_offset);
        get_harras_i32().set([memory_offset, byte_array.length], address >> 2);
    }

    function harras_write_string(address, target_string) {
        if (harras_ascii_check.test(target_string)) {
            const memory_offset = harras_exports.c(target_string.length, 1);
            const u8_view = get_harras_u8();
            for (let i = 0; i < target_string.length; i++) {
                u8_view[memory_offset + i] = target_string.charCodeAt(i);
            }
            get_harras_i32().set([memory_offset, target_string.length], address >> 2);
        } else {
            harras_write_bytes(address, harras_encoder.encode(target_string));
        }
    }

    const HARRAS_BINDINGS = [
            [
                () => navigator.hardwareConcurrency || -1,
                (idx) => harras_heap[idx](),
                (idx, ptr, len) => { harras_heap[idx].lastValue = harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)); },
                (idx, ptr, len) => harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))),
                (idx, prog_idx, ptr, len) => harras_heap[idx].getAttribLocation(harras_heap[prog_idx], harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))),
                (idx) => { harras_heap[idx].remove(); },
                (ptr, len) => { location.hash = `#${harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))}`; },
                (addr, idx) => harras_write_string(addr, harras_heap[idx].value),
                () => window.innerWidth,
                (idx, prop) => harras_heap[idx][prop].uptime,
                (idx) => harras_heap[idx].shift() || 0,
                (ptr, len) => { open(harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)), "_blank", "noopener"); },
                (parent_idx, child_idx) => { harras_heap[parent_idx].appendChild(harras_heap[child_idx]); },
                (idx) => { harras_heap[idx].closePath(); },
                (fn_idx, arg_idx) => harras_heap[fn_idx](harras_heap[arg_idx]),
                (idx) => { harras_heap[idx][1] = true; },
                (idx) => { harras_heap[idx].style.clipPath = "none"; },
                (idx) => harras_heap[idx].shift(),
                (addr, ctx_idx) => harras_assign(addr, harras_heap[ctx_idx].createProgram()),
                (idx) => { harras_heap[idx].focus(); },
                (idx) => { harras_heap[idx].save(); },
                (addr) => harras_assign(addr, document.createElement("div")),
                () => !!window.RTCDataChannel,
                (ptr, len) => {
                    try {
                        localStorage.setItem("arras.io", harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)));
                    } catch (err) {}
                },
                (idx, target, param, val) => { harras_heap[idx].texParameteri(target >>> 0, param >>> 0, val); },
                (idx, a, b, c, d, e, f, g, h, i, j, k) => harras_heap[idx](harras_heap[a], b, c, d, e, f, g >>> 0, h, i, j > 0, k > 0),
                (idx, cap) => { harras_heap[idx].disable(cap >>> 0); },
                (idx, loc_idx, val) => { harras_heap[idx].uniform1i(harras_heap[loc_idx], val); },
                (idx, blob_idx, ptr, len) => {
                    harras_heap[idx](new Blob([harras_heap[blob_idx]], {
                        type: harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))
                    }));
                },
                (idx, color, alpha) => {
                    const target = harras_heap[idx];
                    color >>>= 0;
                    target.fillStyle = `rgba(${color >> 16},${color >> 8 & 255},${255 & color},${alpha})`;
                },
                (idx, prop) => harras_heap[idx][prop].mspt,
                (addr, method_idx, ptr, len) => harras_assign(addr, harras_heap[method_idx](harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)))),
                () => Date.now(),
                (idx) => harras_heap[idx].isContextLost(),
                (idx, prog_idx, shader_idx) => { harras_heap[idx].attachShader(harras_heap[prog_idx], harras_heap[shader_idx]); },
                (idx) => harras_heap[idx][0],
                (idx, x, y) => { harras_heap[idx].moveTo(x, y); },
                (addr, ctx_idx, prog_idx, param) => harras_assign(addr, harras_heap[ctx_idx].getProgramParameter(harras_heap[prog_idx], param >>> 0)),
                (ptr, len) => { console.log(harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))); },
                (idx) => harras_heap[idx].readyState,
                (idx, x, y, w, h) => { harras_heap[idx].strokeRect(x, y, w, h); },
                (addr, idx) => harras_write_string(addr, harras_heap[idx][0].ip),
                () => !!navigator.serviceWorker,
                (idx) => { harras_heap[idx].close(); },
                (idx, x, y, w, h) => { harras_heap[idx].style.clipPath = `xywh(${x}px ${y}px ${w}px ${h}px)`; },
                (idx) => { harras_heap[idx].beginPath(); },
                (addr, idx) => harras_write_string(addr, harras_heap[idx].protocol),
                (addr, idx) => {
                    const popped = harras_heap[idx].pop();
                    if (popped != null) harras_write_string(addr, popped);
                },
                (idx, replacement_idx) => { harras_heap[idx].replaceWith(harras_heap[replacement_idx]); },
                (ptr, len) => !!WebAssembly[harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))],
                (idx) => { harras_heap[idx].clip(); },
                (idx) => harras_heap[idx][0].timestamp,
                (addr, canvas_idx) => {
                    const canvas_el = harras_heap[canvas_idx];
                    harras_assign(addr, new Promise(res => canvas_el.toBlob(res)));
                },
                (idx) => harras_heap[idx],
                (idx, shader_idx, ptr, len) => { harras_heap[idx].shaderSource(harras_heap[shader_idx], harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))); },
                () => {
                    try { location.reload(); } catch (err) {}
                },
                () => typeof window.credentialless === "boolean",
                (addr, idx) => harras_assign(addr, harras_heap[idx][1]),
                (idx, x, y, w, h) => { harras_heap[idx].clearRect(x, y, w, h); },
                (idx) => { window.addEventListener("beforeunload", harras_heap[idx]); },
                () => performance.now(),
                (addr) => harras_assign(addr, window),
                (addr, idx) => harras_assign(addr, harras_heap[idx]()),
                (idx) => {
                    const list = harras_heap[idx];
                    if (list.length === 0) return 0;
                    if (list[0].status) return 1;
                    if (list[0].signature) return 2;
                    return 3;
                },
                (addr, idx, ptr1, len1, ptr2, len2) => harras_assign(addr, harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr1, ptr1 + len1)), harras_decoder.decode(get_harras_u8().subarray(ptr2, ptr2 + len2)))),
                (idx, rgb_val) => {
                    const target = harras_heap[idx];
                    rgb_val >>>= 0;
                    target.fillStyle = `rgb(${rgb_val >> 16},${rgb_val >> 8 & 255},${255 & rgb_val})`;
                },
                (idx, a, b, c) => harras_heap[idx](harras_heap[a], b, c),
                (idx, size) => { harras_heap[idx].font = `bold ${size}px Ubuntu`; },
                (addr) => harras_write_string(addr, location.hash),
                (idx) => { window.removeEventListener("beforeunload", harras_heap[idx]); },
                (idx) => harras_heap[idx].shift().clients,
                () => window.innerHeight,
                (addr, idx, ptr, len) => harras_write_string(addr, harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)))),
                (idx, width) => { harras_heap[idx].lineWidth = width; },
                (addr, canvas_idx, alpha_flag) => harras_assign(addr, harras_heap[canvas_idx].getContext("2d", { alpha: alpha_flag > 0 })),
                (addr, ctx_idx) => harras_assign(addr, harras_heap[ctx_idx].createTexture()),
                (idx, mode, first, count) => { harras_heap[idx].drawArrays(mode >>> 0, first, count); },
                (idx) => !harras_heap[idx],
                () => !!navigator.gpu,
                (idx) => { harras_heap[idx] = null; },
                (addr) => harras_write_string(addr, document.referrer),
                (addr, ctx_idx, param) => harras_assign(addr, harras_heap[ctx_idx].getParameter(param >>> 0)),
                (addr) => harras_assign(addr, document.createElement("canvas")),
                (idx) => harras_heap[idx].complete,
                (idx, size) => { harras_heap[idx].font = `${size}px Trebuchet MS`; },
                (addr, idx, key) => harras_write_string(addr, harras_heap[idx][key].host),
                () => document.fullscreenElement != null,
                (idx, ptr1, len1, ptr2, len2) => harras_heap[idx](get_harras_u8().subarray(ptr1, ptr1 + len1), harras_decoder.decode(get_harras_u8().subarray(ptr2, ptr2 + len2))),
                (idx, x, y, r, sa, ea) => { harras_heap[idx].arc(x, y, r, sa, ea); },
                (idx) => { harras_heap[idx].restore(); },
                (idx, x, y) => { harras_heap[idx].translate(x, y); },
                () => new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset(),
                (idx) => {
                    const list = harras_heap[idx];
                    return list.length === 0 ? -1 : list.shift();
                },
                (idx, attr_idx) => { harras_heap[idx].enableVertexAttribArray(attr_idx >>> 0); },
                (idx, src_rgb, dst_rgb, src_alpha, dst_alpha) => { harras_heap[idx].blendFuncSeparate(src_rgb >>> 0, dst_rgb >>> 0, src_alpha >>> 0, dst_alpha >>> 0); },
                (addr, idx) => harras_assign(addr, Object.values(harras_heap[idx].shift().status)),
                (addr, idx) => harras_write_bytes(addr, harras_heap[idx]),
                (ptr1, len1, ptr2, len2) => { console.log(harras_decoder.decode(get_harras_u8().subarray(ptr1, ptr1 + len1)), harras_decoder.decode(get_harras_u8().subarray(ptr2, ptr2 + len2))); },
                (idx, target, ptr, len, usage) => { harras_heap[idx].bufferData(target >>> 0, get_harras_u8().subarray(ptr, ptr + len), usage >>> 0); },
                (addr, fn_idx, arg_idx) => harras_write_string(addr, harras_heap[fn_idx](harras_heap[arg_idx])),
                (idx, ptr, len) => harras_heap[idx](get_harras_u8().subarray(ptr, ptr + len)),
                (idx, a, b, c, d, e, f) => harras_heap[idx](harras_heap[a], b, c, d, e, f),
                (addr, fn_idx, arg_idx) => {
                    const result_arr = harras_heap[fn_idx](harras_heap[arg_idx]);
                    const offset = harras_exports.c(result_arr.length << 3, 8);
                    if (!harras_cache_f64 || harras_cache_f64.byteLength === 0) {
                        harras_cache_f64 = new Float64Array(harras_exports.g.buffer);
                    }
                    harras_cache_f64.set(result_arr, offset >> 3);
                    get_harras_i32().set([offset, result_arr.length], addr >> 2);
                },
                (idx, sfactor, dfactor) => { harras_heap[idx].blendFunc(sfactor >>> 0, dfactor >>> 0); },
                (idx, func) => { harras_heap[idx].depthFunc(func >>> 0); },
                (addr, idx, obj_idx, flag) => harras_assign(addr, harras_heap[idx](harras_heap[obj_idx], flag > 0)),
                (idx) => {
                    const target = harras_heap[idx];
                    target.addEventListener("focus", () => target.select());
                },
                (idx, prop) => harras_heap[idx][prop].clients,
                (idx, target, tex_idx) => { harras_heap[idx].bindTexture(target >>> 0, harras_heap[tex_idx]); },
                (idx, prog_idx) => { harras_heap[idx].linkProgram(harras_heap[prog_idx]); },
                (idx) => document.activeElement === harras_heap[idx],
                (promise_idx, callback_idx) => {
                    harras_heap[promise_idx].then(res => harras_heap[callback_idx](res));
                },
                (idx, x, y, w, h) => { harras_heap[idx].scissor(x, y, w, h); },
                () => parent !== top,
                (idx, x, y, w, h) => { harras_heap[idx].viewport(x, y, w, h); },
                (idx, a, b, c, d, e, f, g, h, i) => harras_write_bytes(idx, harras_heap[a](b >>> 0, harras_heap[c], d, e, f, g, h >>> 0, i >>> 0)),
                (idx, prop) => harras_heap[idx][prop].hidden,
                (idx) => { harras_heap[idx].fill(); },
                (idx, color, alpha) => {
                    const target = harras_heap[idx];
                    color >>>= 0;
                    target.strokeStyle = `rgba(${color >> 16},${color >> 8 & 255},${255 & color},${alpha})`;
                },
                (addr, fn_idx, arg_idx) => harras_assign(addr, harras_heap[fn_idx](harras_heap[arg_idx])),
                (addr, idx, key) => harras_write_string(addr, harras_heap[idx][key].name),
                (idx, prop) => harras_heap[idx][prop].online,
                () => !!window.WebTransport,
                (addr) => harras_assign(addr, []),
                (addr, idx) => harras_write_string(addr, harras_heap[idx].shift().signature),
                (addr, idx) => harras_write_string(addr, harras_heap[idx]),
                (addr, idx, obj_idx, ptr, len) => harras_assign(addr, harras_heap[idx](harras_heap[obj_idx], harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)))),
                (addr, idx) => harras_write_bytes(addr, harras_heap[idx].shift()),
                (idx, alpha) => { harras_heap[idx].globalAlpha = alpha; },
                (idx, texture) => { harras_heap[idx].activeTexture(texture >>> 0); },
                (addr, idx, ptr1, len1, ptr2, len2, obj_idx) => harras_assign(addr, harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr1, ptr1 + len1)), harras_decoder.decode(get_harras_u8().subarray(ptr2, ptr2 + len2)), harras_heap[obj_idx])),
                (idx) => { harras_heap[idx].lineCap = "butt"; },
                (idx, size) => { harras_heap[idx].font = `${size}px Ubuntu`; },
                (idx) => typeof harras_heap[idx] === "boolean",
                (idx) => { harras_heap[idx].lineJoin = "miter"; },
                (addr, ctx_idx, type) => harras_assign(addr, harras_heap[ctx_idx].createShader(type >>> 0)),
                (idx, loc_idx, x, y) => { harras_heap[idx].uniform2f(harras_heap[loc_idx], x, y); },
                (idx) => { harras_heap[idx].style.textAlign = "center"; },
                (addr) => harras_write_string(addr, navigator.userAgent || ""),
                (addr, idx) => harras_write_string(addr, harras_heap[idx]()),
                (idx, ptr, len, x, y) => { harras_heap[idx].strokeText(harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)), x, y); },
                (idx, img_idx, sx, sy, sw, sh, dx, dy, dw, dh) => {
                    try { harras_heap[idx].drawImage(harras_heap[img_idx], sx, sy, sw, sh, dx, dy, dw, dh); } catch (err) {}
                },
                (idx, ptr, len) => harras_heap[idx].measureText(harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len))).width,
                (addr, idx) => harras_write_string(addr, harras_heap[idx].lastValue),
                (idx) => { harras_heap[idx].lineCap = "round"; },
                (idx, target, level, internalformat, width, height, source_idx) => { harras_heap[idx].texImage2D(target >>> 0, level, internalformat >>> 0, width >>> 0, height >>> 0, harras_heap[source_idx]); },
                (addr) => harras_write_string(addr, location.hostname),
                (addr, ctx_idx, prog_idx, ptr, len) => harras_assign(addr, harras_heap[ctx_idx].getUniformLocation(harras_heap[prog_idx], harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)))),
                (idx) => harras_heap[idx].length,
                (idx) => { harras_heap[idx].stroke(); },
                (addr, idx) => harras_write_string(addr, harras_heap[idx].shift()),
                () => !!window.RTCPeerConnection,
                () => window.arrasAdDone,
                () => crypto.getRandomValues(new Uint32Array(1))[0],
                (idx, ptr, len) => {
                    const ws = harras_heap[idx];
                    const data = get_harras_u8().subarray(ptr, ptr + len);
                    if (ws.readyState === 1) ws.send(data);
                },
                (addr, idx, obj_idx) => harras_assign(addr, harras_heap[idx](harras_heap[obj_idx], harras_flag)),
                () => typeof window.crossOriginIsolated === "boolean",
                (idx, mask) => { harras_heap[idx].clear(mask >>> 0); },
                (idx, x, y) => { harras_heap[idx].lineTo(x, y); },
                (addr, ctx_idx) => harras_assign(addr, harras_heap[ctx_idx].createBuffer()),
                (idx, prog_idx) => { harras_heap[idx].useProgram(harras_heap[prog_idx]); },
                (idx) => typeof harras_heap[idx] === "string",
                (idx, pname, param) => { harras_heap[idx].pixelStorei(pname >>> 0, param); },
                (idx, ptr1, len1, ptr2, len2) => {
                    harras_heap[idx](new Blob([get_harras_u8().subarray(ptr1, ptr1 + len1)], {
                        type: harras_decoder.decode(get_harras_u8().subarray(ptr2, ptr2 + len2))
                    }));
                },
                (idx, index, size, type, normalized, stride, offset) => { harras_heap[idx].vertexAttribPointer(index >>> 0, size, type >>> 0, normalized > 0, stride, offset); },
                (idx, img_idx, x, y, w, h) => {
                    try { harras_heap[idx].drawImage(harras_heap[img_idx], x, y, w, h); } catch (err) {}
                },
                (addr, idx) => harras_assign(addr, harras_heap[idx](harras_flag)),
                (idx, loc_idx, x, y, z) => { harras_heap[idx].uniform3f(harras_heap[loc_idx], x, y, z); },
                (idx, x, y, w, h) => { harras_heap[idx].rect(x, y, w, h); },
                (idx, ptr, len, obj_idx) => harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)), harras_heap[obj_idx], harras_flag),
                (idx) => harras_heap[idx].pop(),
                (idx) => typeof harras_heap[idx] === "number",
                (idx, rgb_val) => {
                    const target = harras_heap[idx];
                    rgb_val >>>= 0;
                    target.strokeStyle = `rgb(${rgb_val >> 16},${rgb_val >> 8 & 255},${255 & rgb_val})`;
                },
                (idx, ptr, len, obj_idx, type) => harras_heap[idx](harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)), harras_heap[obj_idx], type >>> 0),
                (idx) => { harras_heap[idx].lineJoin = "round"; },
                (idx, prop) => harras_heap[idx][prop].maxClients || 0,
                () => window.devicePixelRatio,
                (idx, img_idx, x, y) => {
                    try { harras_heap[idx].drawImage(harras_heap[img_idx], x, y); } catch (err) {}
                },
                (idx, x, y, w, h) => { harras_heap[idx].fillRect(x, y, w, h); },
                (idx, r, g, b, a) => { harras_heap[idx].blendColor(r, g, b, a); },
                (addr, idx, key) => harras_write_string(addr, harras_heap[idx][key].code),
                (idx, prop) => harras_heap[idx][prop].featured,
                (idx, cap) => { harras_heap[idx].enable(cap >>> 0); },
                (addr) => harras_assign(addr, null),
                (idx, shader_idx) => { harras_heap[idx].compileShader(harras_heap[shader_idx]); },
                (ptr, len) => { location.hash = harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)); },
                (idx, ptr, len, x, y) => { harras_heap[idx].fillText(harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)), x, y); },
                (idx, ptr, len) => { harras_heap[idx].value = harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)); },
                (idx, target, buffer_idx) => { harras_heap[idx].bindBuffer(target >>> 0, harras_heap[buffer_idx]); },
                (ptr, len) => WebAssembly.validate(get_harras_u8().subarray(ptr, ptr + len)),
                (idx, mode, count, type, offset) => { harras_heap[idx].drawElements(mode >>> 0, count, type >>> 0, offset); },
                (idx, ptr, len) => { harras_heap[idx].style.cursor = harras_decoder.decode(get_harras_u8().subarray(ptr, ptr + len)); }
            ]
        ];

    const harras_fetch = fetch("./app.wasm");
    const harras_buffer = await (await harras_fetch).arrayBuffer();
    const harras_instantiated = await WebAssembly.instantiate(harras_buffer, HARRAS_BINDINGS);

    var harras_exports = harras_instantiated.instance.exports;
    var harras_flag = harras_exports.f;

    harras_exports.b();
})();
