import { connect } from "http2";
import { connection, wallet } from "../../config";
import { PublicKey } from "@solana/web3.js";
import { getTokenBalance } from "../../utils/token";

 
// API route to save generated wallets to SQLite
export default async function handler(req, res) {
  

  try {

     
    const {tokenAddress} = req.query; 

    if(!tokenAddress){
      return res.status(400).json({ error: 'Missing tokenAddress parameter' }); 
    }

    const tokenBalance = await getTokenBalance(new PublicKey(tokenAddress),wallet );
    
    return res.status(200).json({ tokenBalance: tokenBalance });

   } catch (error) {
    console.error('Error fetching wallets:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }}
