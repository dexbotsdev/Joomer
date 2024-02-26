import { ASSOCIATED_TOKEN_PROGRAM_ID, Account, TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAccount, getMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token-2';
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { connection } from "../config";
import { Token    } from '@solana/spl-token';
import { Key } from 'swr';

export const validateMint = async (
  connection: Connection,
  mintAddress: string
) => {
  const mint = await getMint(connection, new PublicKey(mintAddress));
  return mint;
};

export const validateTokenAccount = async (
  connection: Connection,
  tokenAccountAddress: string,
  mintAddress: string,
  ownerAddress: string
) => {
  const account = await getAccount(
    connection,
    new PublicKey(tokenAccountAddress)
  );
  if (
    account.mint.toBase58() === mintAddress &&
    account.owner.toBase58() === ownerAddress
  ) {
    return account;
  } else throw new Error("Invalid mint/owner for token account");
};

export async function getTokenBalance(tokenMintAddress: PublicKey,wallet: Keypair) {
  try {
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, wallet, tokenMintAddress, wallet.publicKey);
    const tokenAccountBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
    console.log( fromTokenAccount,tokenAccountBalance);
    


      return tokenAccountBalance.value.amount;
  } catch (error) {
      console.error('Error fetching token balance:', error);
  }
}


export const transferSPL = async (tokenMintAddress: string, amount: string, destAddress: string, txWallet: Keypair) => {
  const mintPubkey = new PublicKey(tokenMintAddress);
  const destPubkey = new PublicKey(destAddress);
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, txWallet, mintPubkey, txWallet.publicKey);
  const tokenAccountBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
  if (tokenAccountBalance) {
      const decimals = tokenAccountBalance.value.decimals;
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, txWallet, mintPubkey, destPubkey);

      console.log( amount +":"+ Math.floor(Number(amount) * 10 ** decimals)+":"+ decimals)
      const transaction = new Transaction().add(
          createTransferCheckedInstruction(
              fromTokenAccount.address,
              mintPubkey,
              toTokenAccount.address,
              txWallet.publicKey,
              Math.floor(Number(amount) * 10 ** decimals),
              decimals
          )
      );
      const txhash = await connection.sendTransaction(transaction, [txWallet]);
      return txhash;
  }
  return false;
};