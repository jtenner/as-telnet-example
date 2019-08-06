"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var loader_1 = require("assemblyscript/lib/loader");
var ts_telnet2_1 = require("ts-telnet2");
var fs_1 = __importDefault(require("fs"));
var wasm = loader_1.instantiateBuffer(fs_1.default.readFileSync("./build/optimized.wasm"), {});
var server = ts_telnet2_1.createServer(7070, '127.0.0.1');
var id = 0;
server.on("connection", function (socket) {
    var options = {
        id: id++,
        naws: false,
        window_x: 0,
        window_y: 0,
    };
    socket.do(ts_telnet2_1.Options.BINARY_TRANSMISSION);
    socket.do(ts_telnet2_1.Options.NEGOTIATE_ABOUT_WINDOW_SIZE);
    socket.on("will", function (option) {
        switch (option) {
            case ts_telnet2_1.Options.BINARY_TRANSMISSION:
            case ts_telnet2_1.Options.NEGOTIATE_ABOUT_WINDOW_SIZE:
            case ts_telnet2_1.Options.GMCP:
            case ts_telnet2_1.Options.ECHO:
                socket.do(option, true);
                break;
            default:
                socket.dont(option, true);
        }
        // @ts-ignore
        var underlying = socket.socket;
        console.log("SOCKET WILL " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + ts_telnet2_1.Options[option]);
    });
    socket.on("wont", function (option) {
        socket.dont(option, true);
        // @ts-ignore
        var underlying = socket.socket;
        console.log("SOCKET WONT " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + ts_telnet2_1.Options[option]);
    });
    socket.on("do", function (option) {
        switch (option) {
            case ts_telnet2_1.Options.BINARY_TRANSMISSION:
            case ts_telnet2_1.Options.NEGOTIATE_ABOUT_WINDOW_SIZE:
            case ts_telnet2_1.Options.GMCP:
            case ts_telnet2_1.Options.ECHO:
                socket.will(option, true);
                break;
            default:
                socket.wont(option, true);
        }
        // @ts-ignore
        var underlying = socket.socket;
        console.log("SOCKET DO " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + ts_telnet2_1.Options[option]);
    });
    socket.on("dont", function (option) {
        socket.wont(option, true);
        // @ts-ignore
        var underlying = socket.socket;
        console.log("SOCKET DONT " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + ts_telnet2_1.Options[option]);
    });
    socket.on("subnegotiation", function (option, data) {
        switch (option) {
            case ts_telnet2_1.Options.GMCP: {
                break;
            }
            case ts_telnet2_1.Options.NEGOTIATE_ABOUT_WINDOW_SIZE: {
                options.window_x = data.readUInt16BE(0);
                options.window_y = data.readUInt16BE(2);
            }
        }
        // @ts-ignore
        var underlying = socket.socket;
        // @ts-ignore
        console.log("SOCKET SUB " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + ts_telnet2_1.Options[option] + " " + data.inspect());
    });
    socket.on("data", function (chunk) {
        // TODO:
        // 1. loop over plugins
        // 2. call parse()
        // 3. create jvalue from output using wasm apis
        // 4. pass jvalue object into callback
        // @ts-ignore
        var underlying = socket.socket;
        console.log("SOCKET DATA " + underlying.remoteAddress + ":" + underlying.remotePort + " -> " + chunk.toString(socket.options[ts_telnet2_1.Options.BINARY_TRANSMISSION] ? "utf8" : "ascii"));
    });
});
//# sourceMappingURL=index.js.map