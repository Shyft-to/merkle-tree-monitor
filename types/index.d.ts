export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type CallbackType = {
  fee: number
  type: string
  status: string
  actions: Array<{
    // info: {
    //   owner: string
    //   payer: string
    //   merkle_tree: string
    //   nft_address: string
    //   nft_metadata: {
    //     uri: string
    //     name: string
    //     uses: any
    //     symbol: string
    //     creators: Array<{
    //       share: number
    //       address: string
    //       verified: boolean
    //     }>
    //     isMutable: boolean
    //     collection: any
    //     editionNonce: number
    //     tokenStandard: {
    //       nonFungible: {}
    //     }
    //     primarySaleHappened: boolean
    //     tokenProgramVersion: {
    //       original: {}
    //     }
    //     sellerFeeBasisPoints: number
    //   }
    //   tree_authority: string
    //   update_authority: string
    // }
    info: any
    type: string
    source_protocol: {
      name: string
      address: string
    }
  }>
  signers: Array<string>
  accounts: Array<{
    data: string
    owner: string
    address: string
    lamports: number
  }>
  protocol: {
    name: string
    address: string
  }
  fee_payer: string
  timestamp: string
  signatures: Array<string>
}

export type TransactionType = {
  id: string
  created_at: string
  merkle_tree: string
  merkle_tree: string
  tree_authority: string
  update_authority: string
  nft_address: string
  type: string
  info: any
}
