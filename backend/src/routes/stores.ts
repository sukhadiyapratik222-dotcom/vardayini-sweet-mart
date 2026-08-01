import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET stores with searchable filter: GET /api/stores?city=&pincode=
const defaultStoresList = [
  {
    id: "store-surat-1",
    name: "Vardayini Sweet Mart - Main Outlet",
    address: "123 Ring Road, Near Textile Market",
    city: "Surat",
    pincode: "395002",
    phone: "+91 98765 43210",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    id: "store-surat-2",
    name: "Vardayini Sweet Mart - Station Road",
    address: "45 Station Road, Opposite Railway Station",
    city: "Surat",
    pincode: "395003",
    phone: "+91 98765 43211",
    latitude: 21.2049,
    longitude: 72.8406,
  },
  {
    id: "store-ahmedabad-1",
    name: "Vardayini Sweet Mart - Navrangpura",
    address: "78 CG Road, Navrangpura",
    city: "Ahmedabad",
    pincode: "380009",
    phone: "+91 98765 43212",
    latitude: 23.0366,
    longitude: 72.5612,
  },
  {
    id: "store-vadodara-1",
    name: "Vardayini Sweet Mart - Alkapuri",
    address: "12 Alkapuri Main Road",
    city: "Vadodara",
    pincode: "390007",
    phone: "+91 98765 43213",
    latitude: 22.3107,
    longitude: 73.1685,
  },
  {
    id: "store-delhi-1",
    name: "Vardayini Sweet Mart - Old Delhi Branch",
    address: "123 Chawri Bazar Rd, Old Delhi",
    city: "Delhi",
    pincode: "110006",
    phone: "+91 98765 43214",
    latitude: 28.6500,
    longitude: 77.2300,
  },
];

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

    let stores = await prisma.store.findMany({
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

    if (!stores || stores.length === 0) {
      // Filter default stores list
      let filtered = defaultStoresList;
      if (city && String(city).trim() !== "") {
        const c = String(city).trim().toLowerCase();
        filtered = filtered.filter(
          (s) => s.city.toLowerCase().includes(c) || s.name.toLowerCase().includes(c) || s.address.toLowerCase().includes(c)
        );
      }
      if (pincode && String(pincode).trim() !== "") {
        const p = String(pincode).trim();
        filtered = filtered.filter((s) => s.pincode.includes(p));
      }
      return res.json(filtered);
    }

    res.json(stores);
  } catch (err) {
    res.json(defaultStoresList);
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
