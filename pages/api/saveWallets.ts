// Import necessary dependencies
import sqlite3 from 'sqlite3';

// Initialize SQLite database connection
const dbPromise = new sqlite3.Database('./wallets.db');

// API route to save generated wallets to SQLite
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { accounts } = req.body;

      // Ensure the wallets array is provided
      if (!accounts || !Array.isArray(accounts)) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Insert wallet addresses into the SQLite database
      const db = await dbPromise;

       await db.exec(`
        CREATE TABLE IF NOT EXISTS wallets (
          id INTEGER PRIMARY KEY,
          publicKey TEXT NOT NULL, 
          privateKey TEXT NOT NULL
        )
      `);



      const stmt = await db.prepare('INSERT INTO wallets (publicKey,privateKey) VALUES (?,?)');

      for (const wallet of accounts) {
        await stmt.run(wallet.publicKey,wallet.privateKey);
      }

      await stmt.finalize();

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(404).json({ error: 'Not Found' });
}
