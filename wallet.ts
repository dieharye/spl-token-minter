import { Keypair, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import * as fs from 'fs';
import bs58 from 'bs58';

//STEP 1 - Connect to Solana Network
const endpoint = 'https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd'; //Replace with your QuickNode RPC Endpoint
const solanaConnection = new Connection(endpoint);

//STEP 2 - Generate a New Solana Wallet
const keypair = Keypair.generate();
console.log(`Generated new KeyPair. Wallet PublicKey: `, keypair.publicKey.toString());

//STEP 3 - Convert Private key to Base58
const privateKey = bs58.encode(keypair.secretKey);
console.log(`Wallet PrivateKey:`, privateKey);

//STEP 4 - Write Wallet Secret Key to a .JSON
const secret_array = keypair.secretKey    
    .toString() //convert secret key to string
    .split(',') //delimit string by commas and convert to an array of strings
    .map(value=>Number(value)); //convert string values to numbers inside the array

const secret = JSON.stringify(secret_array); //Covert to JSON string

fs.writeFile('guideSecret.json', secret, 'utf8', function(err) {
    if (err) throw err;
    console.log('Wrote secret key to guideSecret.json.');
});

//STEP 5 - Airdrop 1 SOL to new wallet
(async()=>{
    const airdropSignature = solanaConnection.requestAirdrop(
        keypair.publicKey,
        LAMPORTS_PER_SOL,
    );
    try{
        const txId = await airdropSignature;     
        console.log(`Airdrop Transaction Id: ${txId}`);        
        console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`)
    }
    catch(err){
        console.log(err);
    }    
})()