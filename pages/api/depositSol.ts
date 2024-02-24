import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import cluster from 'cluster';
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
 
// Initialize SQLite database connection
const dbPromise = new sqlite3.Database('./wallets.db');
const connection = new Connection('https://api.devnet.solana.com','confirmed');
const devnetKey = [155,16,137,64,184,35,81,185,19,133,229,35,172,185,230,123,71,78,187,97,113,237,14,123,180,168,47,170,122,123,114,105,187,19,135,4,73,123,236,202,93,65,211,172,65,28,29,147,248,41,147,214,107,240,40,33,101,14,102,193,193,139,255,100]

const wallet = Keypair.fromSecretKey(Uint8Array.from(devnetKey));



function getWallets(masterWallet) {
    const query =  `SELECT publicKey,  masterWalletAddress FROM wallets WHERE masterWalletAddress = '${masterWallet}'`  

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
        const { masterWalletAddress } = req.body;
  
        if (!masterWalletAddress ) {
          return res.status(400).json({ error: 'Invalid masterWalletAddress' });
        }
  
        const generatedWallets = [];
        const responseWallets = [];
        const wallets:any = await getWallets(masterWalletAddress);

        
        for (let i = 0; i < wallets.length; i++) {
            const lamports = 1e8;  
            const randAmnt = new BN(Number(lamports* Math.random()).toFixed(0));
          const walletAddress = wallets[i].publicKey; 
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: new PublicKey(walletAddress),
              lamports:randAmnt.toNumber(),
            })
          );
          const tnxId = await connection.sendTransaction(transaction,[wallet]);
          console.log(tnxId);

        }
    
          for(const wallet of wallets){
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
        console.error('Error depositing to  wallets:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    }  
  
    return res.status(404).json({ error: 'Not Found' });
  }