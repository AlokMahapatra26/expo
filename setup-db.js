// Run this script to set up MongoDB indexes
// node setup-db.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-manager';

async function setupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('expenses').createIndex({ userId: 1 });
    await db.collection('expenses').createIndex({ date: -1 });
    await db.collection('expenses').createIndex({ userId: 1, date: -1 });

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
