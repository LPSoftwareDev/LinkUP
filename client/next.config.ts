import type { NextConfig } from "next";
import os from "os";

function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Check for IPv4 and skip internal addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || `http://${localIp}:8080`,
    NEXT_PUBLIC_WEBSOCKET_URL:
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://${localIp}:8080`,
  },
  experimental: {
    reactCompiler: true,
  }
};

export default nextConfig;
