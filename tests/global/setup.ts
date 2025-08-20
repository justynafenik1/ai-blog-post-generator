import { spawn, ChildProcess } from "child_process";
import http from "http";
import fs from "fs";

let serverProcess: ChildProcess;
function waitForServer(url: string, timeout = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeout) {
        return reject(new Error("Server did not start in time"));
      }
      http
        .get(url, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
            resolve();
          } else {
            setTimeout(check, 500);
          }
        })
        .on("error", () => setTimeout(check, 500));
    };
    check();
  });
}

async function globalSetup() {
  serverProcess = spawn("node", ["server.js"], { stdio: "inherit" });

  if (serverProcess.pid) {
    fs.writeFileSync("server.pid", serverProcess.pid.toString());
  } else {
    throw new Error("Failed to start the server process (pid is undefined)");
  }

  await waitForServer("http://localhost:3000");

  console.log("Server is ready");
}

export default globalSetup;
