import {
  percentAmount,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createAndMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import secret from "./guideSecret.json";
import { uploadJSONToPinata } from "./metadata";

const umi = createUmi(
  "https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd"
); //Replace with your QuickNode RPC Endpoint

const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

const uploadingMetadata = {
  name: "Num Token",
  symbol: "NUM",
  description: "This is the demo token",
  image:
    "https://gateway.pinata.cloud/ipfs/QmW8dkwU7TPNevrYby8WesE5kRduWNF2MQJowwGw4N9QST",
};

const main = async () => {
  const metaDataURI = await uploadJSONToPinata(uploadingMetadata);

  const metadata = {
    name: "Num Token",
    symbol: "NUM",
    description: "This is the demo token",
    uri: `https://ipfs.io/ipfs/${metaDataURI}`,
  };

  console.log(metadata);

  const mint = generateSigner(umi);
  umi.use(signerIdentity(userWalletSigner));
  umi.use(mplTokenMetadata());

  createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 8,
    amount: 1000000_00000000,
    tokenOwner: userWallet.publicKey,
    tokenStandard: TokenStandard.Fungible,
  })
    .sendAndConfirm(umi)
    .then(() => {
      console.log(
        "Successfully minted 1 million tokens (",
        mint.publicKey,
        ")"
      );
    })
    .catch((err) => {
      console.error("Error minting tokens:", err);
    });
};

main();
