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
      // Auto-seed default stores into database so Admin & Storefront share same DB table
      for (const s of defaultStoresList) {
        try {
          const { id, ...storeFields } = s;
          const existing = await prisma.store.findFirst({ where: { name: s.name } });
          if (!existing) {
            await prisma.store.create({ data: storeFields });
          }
        } catch (e) {}
      }

      stores = await prisma.store.findMany({
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
    }

    res.json(stores);
  } catch (err) {
    res.json(defaultStoresList);
  }
});

import { StoreSchema, formatZodError } from "../validators/schemaValidators";

const isValidObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

// POST add a new store outlet
router.post("/", async (req, res) => {
  const result = StoreSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(formatZodError(result.error));
  }

  try {
    const { name, address, city, pincode, phone } = result.data;
    const { latitude, longitude } = req.body;

    const store = await prisma.store.create({
      data: {
        name,
        address,
        city,
        pincode,
        phone,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
    });

    res.status(201).json({ success: true, store });
  } catch (err: any) {
    res.status(500).json({ success: false, errors: { name: err.message || "Failed to create store outlet" } });
  }
});

// PUT update an existing store outlet
router.put("/:id", async (req, res) => {
  const result = StoreSchema.partial().safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(formatZodError(result.error));
  }

  try {
    const { id } = req.params;
    const { name, address, city, pincode, phone } = result.data;
    const { latitude, longitude } = req.body;

    const updateFields: any = {
      ...(name ? { name } : {}),
      ...(address ? { address } : {}),
      ...(city ? { city } : {}),
      ...(pincode ? { pincode } : {}),
      ...(phone ? { phone } : {}),
      ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
      ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
    };

    if (isValidObjectId(id)) {
      const store = await prisma.store.update({
        where: { id },
        data: updateFields,
      });
      return res.json({ success: true, store });
    }

    const existing = await prisma.store.findFirst({ where: { name } });
    if (existing) {
      const store = await prisma.store.update({
        where: { id: existing.id },
        data: updateFields,
      });
      return res.json({ success: true, store });
    }

    res.status(404).json({ success: false, errors: { name: "Store outlet not found" } });
  } catch (err: any) {
    res.status(500).json({ success: false, errors: { name: err.message || "Failed to update store outlet" } });
  }
});

// DELETE remove a store outlet
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.store.delete({ where: { id } });
    res.json({ message: "Store outlet deleted successfully", id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete store outlet." });
  }
});

export default router;
