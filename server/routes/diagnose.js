import { Router } from 'express';
import si from 'systeminformation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [cpu, mem, fsSize, battery, osInfo, graphics, cpuTemperature] =
      await Promise.all([
        si.cpu(),
        si.mem(),
        si.fsSize(),
        si.battery(),
        si.osInfo(),
        si.graphics(),
        si.cpuTemperature(),
      ]);

    const data = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speedGHz: cpu.speed,
      },
      memory: {
        totalGB: +(mem.total / 1024 ** 3).toFixed(2),
        usedGB: +(mem.active / 1024 ** 3).toFixed(2),
        freeGB: +(mem.available / 1024 ** 3).toFixed(2),
        usedPercent: mem.total ? +((mem.active / mem.total) * 100).toFixed(1) : null,
      },
      disks: (fsSize || []).map((d) => ({
        mount: d.mount,
        type: d.type,
        sizeGB: +(d.size / 1024 ** 3).toFixed(2),
        usedGB: +(d.used / 1024 ** 3).toFixed(2),
        usedPercent: d.use,
      })),
      battery: battery && battery.hasBattery
        ? {
            hasBattery: true,
            percent: battery.percent,
            isCharging: battery.isCharging,
            cycleCount: battery.cycleCount ?? null,
            maxCapacity: battery.maxCapacity ?? null,
            designedCapacity: battery.designedCapacity ?? null,
          }
        : { hasBattery: false },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
      },
      graphics: {
        controllers: (graphics.controllers || []).map((g) => ({
          vendor: g.vendor,
          model: g.model,
          vramMB: g.vram,
        })),
      },
      temperature: {
        cpuMainC: cpuTemperature.main ?? null,
        cpuMaxC: cpuTemperature.max ?? null,
      },
      collectedAt: new Date().toISOString(),
    };

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
