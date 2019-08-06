import { instantiateBuffer } from "assemblyscript/lib/loader";
import { createServer, Negotiation, Options } from "ts-telnet2";
import * as net from "net";
import fs from "fs";

const wasm = instantiateBuffer(fs.readFileSync("./build/optimized.wasm"), {});
const server = createServer(7070, '127.0.0.1');

let id = 0;

server.on("connection", (socket) => {
  const options = {
    id: id++,
    naws: false,
    window_x: 0,
    window_y: 0,
  };

  socket.do(Options.BINARY_TRANSMISSION);
  socket.do(Options.NEGOTIATE_ABOUT_WINDOW_SIZE);

  socket.on("will", (option) => {
    switch (option) {
      case Options.BINARY_TRANSMISSION:
      case Options.NEGOTIATE_ABOUT_WINDOW_SIZE:
      case Options.GMCP:
      case Options.ECHO:
        socket.do(option, true);
        break;
      default:
        socket.dont(option, true);
    }
    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    console.log(`SOCKET WILL ${underlying.remoteAddress}:${underlying.remotePort} -> ${Options[option]}`);
  });

  socket.on("wont", (option) => {
    socket.dont(option, true);
    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    console.log(`SOCKET WONT ${underlying.remoteAddress}:${underlying.remotePort} -> ${Options[option]}`);
  });

  socket.on("do", (option) => {
    switch (option) {
      case Options.BINARY_TRANSMISSION:

      case Options.NEGOTIATE_ABOUT_WINDOW_SIZE:
      case Options.GMCP:
      case Options.ECHO:
        socket.will(option, true);
        break;
      default:
        socket.wont(option, true);
    }
    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    console.log(`SOCKET DO ${underlying.remoteAddress}:${underlying.remotePort} -> ${Options[option]}`);
  });

  socket.on("dont", (option) => {
    socket.wont(option, true);
    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    console.log(`SOCKET DONT ${underlying.remoteAddress}:${underlying.remotePort} -> ${Options[option]}`);
  });

  socket.on("subnegotiation", (option, data) => {
    switch (option) {
      case Options.GMCP: {
        break;
      }
      case Options.NEGOTIATE_ABOUT_WINDOW_SIZE: {
        options.window_x = data.readUInt16BE(0);
        options.window_y = data.readUInt16BE(2);
      }
    }

    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    // @ts-ignore
    console.log(`SOCKET SUB ${underlying.remoteAddress}:${underlying.remotePort} -> ${Options[option]} ${data.inspect()}`);
  });

  socket.on("data", (chunk) => {
    // TODO:
    // 1. loop over plugins
    // 2. call parse()
    // 3. create jvalue from output using wasm apis
    // 4. pass jvalue object into callback
    // @ts-ignore
    let underlying: net.Socket = socket.socket;
    console.log(`SOCKET DATA ${underlying.remoteAddress}:${underlying.remotePort} -> ${chunk.toString(
      socket.options[Options.BINARY_TRANSMISSION] ? "utf8" : "ascii",
    )}`);
  });
});
