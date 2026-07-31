import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET stores with searchable filter: GET /api/stores?city=&pincode=
router.get("/", async (req, res) => {
  try {
    const { city, pincode } = req.query;
    const where: any = {};

    if (city && String(city).trim() !== "") {
      const cityQuery = String(city).trim();
      where.OR = [
        { city: { contains: cityQuery } },
        { name: { contains: cityQuery } },
        { address: { contains: cityQuery } },
      ];
    }

    if (pincode && String(pincode).trim() !== "") {
      where.pincode = { contains: String(pincode).trim() };
    }

    const stores = await prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        pincode: true,
        phone: true,
        latitude: true,
        longitude: true,
      },
    });

    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch store outlets" });
  }
});

// POST add a new store outlet
router.post("/", async (req, res) => {
  try {
    const { name, address, city, pincode, phone, latitude, longitude } = req.body;
    if (!name || !address || !city || !pincode) {
      return res.status(400).json({ error: "Name, address, city, and pincode are required" });
    }

    const store = await prisma.store.create({
      data: {
        id: `store-${Date.now()}`,
        name,
        address,
        city,
        pincode,
        phone: phone || "+91 98765 43210",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
    });

    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ error: "Failed to create store outlet" });
  }
});

// PUT update an existing store outlet
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, pincode, phone, latitude, longitude } = req.body;

    const store = await prisma.store.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(address ? { address } : {}),
        ...(city ? { city } : {}),
        ...(pincode ? { pincode } : {}),
        ...(phone ? { phone } : {}),
        ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
      },
    });

    res.json(store);
  } catch (err) {
    res.status(500).json({ error: "Failed to update store outlet" });
  }
});

// DELETE remove a store outlet
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.store.delete({ where: { id } });
    res.json({ message: "Store outlet deleted successfully", id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete store outlet" });
  }
});

export default router;
