import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import cluster from 'cluster';
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { ClusterType } from '../../context/SolanaContext';

// Initialize SQLite database connection
const dbPromise = new sqlite3.Database('./wallets.db');
const connection = new Connection('https://api.devnet.solana.com','confirmed');
const devnetKey = [155,16,137,64,184,35,81,185,19,133,229,35,172,185,230,123,71,78,187,97,113,237,14,123,180,168,47,170,122,123,114,105,187,19,135,4,73,123,236,202,93,65,211,172,65,28,29,147,248,41,147,214,107,240,40,33,101,14,102,193,193,139,255,100]

const wallet = Keypair.fromSecretKey(Uint8Array.from(devnetKey));


function getWallets(masterWallet) {
    var query =  `SELECT publicKey,  masterWalletAddress FROM wallets WHERE masterWalletAddress = '${masterWallet}'`  

    return new Promise(resolve => 
        dbPromise.all(query, (err, rows) =>
            err ? console.log(err)
                : resolve(rows)
        )
    );
}


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
            balance:0,
            masterWalletAddress: masterKeypair
          });

          const db = dbPromise;

          db.exec(`
          CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY,
            publicKey TEXT NOT NULL, 
            privateKey TEXT NOT NULL,
            masterWalletAddress  TEXT NOT NULL
          )
        `);
          db.run(
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

        console.log(req.query); 
        const { masterWalletAddress } = req.query; 
        if (!masterWalletAddress) {
          return res.status(400).json({ error: 'Missing masterWalletAddress parameter' });
        }
  
        const responseWallets =[]
         const wallets :any= await getWallets(masterWalletAddress)

           for(var wallet of wallets){
                const balance = await connection.getBalance(new PublicKey(wallet.publicKey));
                const lamp = Number(balance/1e9).toFixed(4);
                responseWallets.push({
                    publicKey: wallet.publicKey,
                    balance: lamp + 'SOL ',
                    masterWalletAddress: wallet.masterWalletAddress
                })
           }

          return res.status(200).json({ wallets: responseWallets });
      } catch (error) {
        console.error('Error fetching wallets:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    }
  
    return res.status(404).json({ error: 'Not Found' });
  }
  