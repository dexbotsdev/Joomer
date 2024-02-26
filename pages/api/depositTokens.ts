import { ASSOCIATED_TOKEN_PROGRAM_ID, Account, getMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token-2';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import cluster from 'cluster';
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { wallet, dbPromise, connection } from '../../config';
import { getTokenBalance, transferSPL } from '../../utils/token';
import { TokenInstructions } from '@project-serum/serum';
import base58 from 'bs58';


const senderKeyPair = wallet;


function getWallets(masterWallet) {
  const query = `SELECT publicKey, privateKey, masterWalletAddress FROM wallets WHERE masterWalletAddress = '${masterWallet}'`

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
      const { masterWalletAddress, tokenAddress } = req.body;

      if (!masterWalletAddress) {
        return res.status(400).json({ error: 'Invalid masterWalletAddress' });
      }

      const responseWallets = [];
      let wallets: any = await getWallets(masterWalletAddress);
      const randomAmount = ''+Math.random()*10000;


      for (let i = 0; i < wallets.length; i++) {

        const walletAddress = wallets[i].publicKey;
        

        const signature = await transferSPL(tokenAddress,randomAmount,walletAddress,senderKeyPair);

        console.log('Transaction sent:', signature); 

      }
      wallets = await getWallets(masterWalletAddress);
      for (let i = 0; i < wallets.length; i++) {

        const wallet = wallets[i];
        const balance = await connection.getBalance(new PublicKey(wallet.publicKey));

        console.log(wallet);


        const kp = Keypair.fromSecretKey(base58.decode(wallet.privateKey));
        const tokenBalance = await getTokenBalance(new PublicKey(tokenAddress), kp);

        const lamp = Number(balance / 1e9).toFixed(4);
        responseWallets.push({
          publicKey: wallet.publicKey,
          balance: lamp + 'SOL  : <br/>' + tokenAddress + ':' + tokenBalance,
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