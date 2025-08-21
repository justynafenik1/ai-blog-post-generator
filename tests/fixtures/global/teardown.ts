import fs from "fs";

async function globalTeardown() {
  if (fs.existsSync("server.pid")) {
    const pid = parseInt(fs.readFileSync("server.pid", "utf-8"));
    try {
      process.kill(pid);
      fs.unlinkSync("server.pid");
      console.log("Server stopped");
    } catch {}
  }
}

export default globalTeardown;
