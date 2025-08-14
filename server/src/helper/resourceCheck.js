import os from 'os';

export default function resourcesAreFree(cpuThreshold = 30, memThreshold = 70) {
  const load = os.loadavg()[0] / os.cpus().length * 100; // CPU usage %
  const memUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100; // Memory usage %

  return load < cpuThreshold && memUsage < memThreshold;
}