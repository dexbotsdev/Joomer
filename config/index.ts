import { Connection, Keypair } from '@solana/web3.js';
import sqlite3 from 'sqlite3';

export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
export const devnetKey = [155, 16, 137, 64, 184, 35, 81, 185, 19, 133, 229, 35, 172, 185, 230, 123, 71, 78, 187, 97, 113, 237, 14, 123, 180, 168, 47, 170, 122, 123, 114, 105, 187, 19, 135, 4, 73, 123, 236, 202, 93, 65, 211, 172, 65, 28, 29, 147, 248, 41, 147, 214, 107, 240, 40, 33, 101, 14, 102, 193, 193, 139, 255, 100];
export const wallet = Keypair.fromSecretKey(Uint8Array.from(devnetKey));
export const dbPromise = new sqlite3.Database('./wallets.db');
