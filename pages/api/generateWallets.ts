import { Keypair } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';

// Initialize SQLite database connection
const dbPromise = new sqlite3.Database('./wallets.db');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      try {
        const { walletCount, masterKey } = req.body;
  
        if (!walletCount || isNaN(walletCount) || walletCount <= 0) {
          return res.status(400).json({ error: 'Invalid walletCount' });
        }
  
        const generatedWallets = [];
        const responseWallets = [];
        const masterKeypair = masterKey 
  
        for (let i = 0; i < walletCount; i++) {
          const keypair = Keypair.generate();
          const walletAddress = keypair.publicKey.toBase58();
          const privateKey = keypair.secretKey;
  
          generatedWallets.push({
            privateKey,
            publicKey: keypair.publicKey.toBase58(),
            masterWalletAddress: masterKeypair
          });
          responseWallets.push({
            publicKey: keypair.publicKey.toBase58(),
            masterWalletAddress: masterKeypair
          });

          const db = await dbPromise;

          await db.exec(`
          CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY,
            publicKey TEXT NOT NULL, 
            privateKey TEXT NOT NULL,
            masterWalletAddress  TEXT NOT NULL
          )
        `);
          await db.run(
            'INSERT INTO wallets (publicKey, privateKey, masterWalletAddress) VALUES (?, ?, ?)',
            keypair.publicKey.toBase58(),
            privateKey,
            masterKeypair
          );
        }
  
        return res.status(200).json({ wallets: responseWallets });
      } catch (error) {
        console.error('Error generating wallets:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    } else if (req.method === 'GET') {
      try {
        const { masterWalletAddress } = req.query;
  
        if (!masterWalletAddress) {
          return res.status(400).json({ error: 'Missing masterWalletAddress parameter' });
        }
  
        const db = await dbPromise;

  
        const wallets = await db.all(
          'SELECT publicKey,  masterWalletAddress FROM wallets WHERE masterWalletAddress = ?',
          masterWalletAddress
        );
  
        return res.status(200).json({ wallets });
      } catch (error) {
        console.error('Error fetching wallets:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    }
  
    return res.status(404).json({ error: 'Not Found' });
  }
  