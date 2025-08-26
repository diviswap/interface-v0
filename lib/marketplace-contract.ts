export const MARKETPLACE_CONTRACT_ADDRESS = "0x8358cFA660e5638988f1b3403885A9B116cA87C1"

export const MARKETPLACE_CONTRACT_ABI = [
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "string",
                    name: "name",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "metadataURI",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "implementation",
                    type: "address",
                  },
                ],
                internalType: "struct IExtension.ExtensionMetadata",
                name: "metadata",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "bytes4",
                    name: "functionSelector",
                    type: "bytes4",
                  },
                  {
                    internalType: "string",
                    name: "functionSignature",
                    type: "string",
                  },
                ],
                internalType: "struct IExtension.ExtensionFunction[]",
                name: "functions",
                type: "tuple[]",
              },
            ],
            internalType: "struct IExtension.Extension[]",
            name: "extensions",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "royaltyEngineAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "nativeTokenWrapper",
            type: "address",
          },
        ],
        internalType: "struct MarketplaceV3.MarketplaceConstructorParams",
        name: "_marketplaceV3Params",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // Key marketplace functions
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "assetContract",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quantity",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "pricePerToken",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "startTimestamp",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "endTimestamp",
            type: "uint128",
          },
          {
            internalType: "bool",
            name: "reserved",
            type: "bool",
          },
        ],
        internalType: "struct IDirectListings.ListingParameters",
        name: "_params",
        type: "tuple",
      },
    ],
    name: "createListing",
    outputs: [
      {
        internalType: "uint256",
        name: "listingId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_listingId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_buyFor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_currency",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_expectedTotalPrice",
        type: "uint256",
      },
    ],
    name: "buyFromListing",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_startId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endId",
        type: "uint256",
      },
    ],
    name: "getAllValidListings",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "listingId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quantity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pricePerToken",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "startTimestamp",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "endTimestamp",
            type: "uint128",
          },
          {
            internalType: "address",
            name: "listingCreator",
            type: "address",
          },
          {
            internalType: "address",
            name: "assetContract",
            type: "address",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
          {
            internalType: "enum IDirectListings.TokenType",
            name: "tokenType",
            type: "uint8",
          },
          {
            internalType: "enum IDirectListings.Status",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "reserved",
            type: "bool",
          },
        ],
        internalType: "struct IDirectListings.Listing[]",
        name: "_validListings",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalListings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
