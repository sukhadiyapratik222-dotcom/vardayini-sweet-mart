const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    const db = client.db();

    const collections = ['products', 'users', 'admins', 'carts', 'orders', 'payments', 'coupons', 'reviews', 'blog_posts'];

    for (const colName of collections) {
      const collection = db.collection(colName);

      // Find all documents
      const docs = await collection.find({}).toArray();
      let updatedCount = 0;

      for (const doc of docs) {
        let needsUpdate = false;
        const updateSet = {};
        const updateUnset = {};

        // Check created_at field
        const ca = doc.created_at;
        if (ca === null || ca === undefined) {
          updateSet.created_at = new Date();
          needsUpdate = true;
        } else if (typeof ca === 'string') {
          // If it is a string representation of date, parse it
          const parsedDate = new Date(ca);
          if (!isNaN(parsedDate.getTime())) {
            updateSet.created_at = parsedDate;
            needsUpdate = true;
          } else {
            updateSet.created_at = new Date();
            needsUpdate = true;
          }
        } else if (ca instanceof Date && isNaN(ca.getTime())) {
          // Invalid Date object
          updateSet.created_at = new Date();
          needsUpdate = true;
        }

        // Check if there is an unmapped createdAt field and remove/unset it to prevent schema conflicts
        const ca2 = doc.createdAt;
        if (ca2 !== undefined) {
          updateUnset.createdAt = "";
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updateDoc = {};
          if (Object.keys(updateSet).length > 0) {
            updateDoc.$set = updateSet;
          }
          if (Object.keys(updateUnset).length > 0) {
            updateDoc.$unset = updateUnset;
          }
          await collection.updateOne({ _id: doc._id }, updateDoc);
          updatedCount++;
        }
      }

      console.log(`Collection '${colName}': Checked ${docs.length} docs, updated ${updatedCount} docs.`);
    }

  } catch (err) {
    console.error("Error connecting or updating:", err);
  } finally {
    await client.close();
  }
}

main();
