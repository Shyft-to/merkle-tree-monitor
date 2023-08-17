import supabase from "@/lib/supabase"
import { CallbackType } from "@/types"
import { NextApiRequest, NextApiResponse } from "next"

type BaseResponse = {
  success: boolean
  data?: Object
  error?: string
}

export type RequestBody = {
  tree: string
}

interface ExtendedNextApiRequest extends NextApiRequest {
  body: CallbackType
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse<BaseResponse>) {
  if (req.method === "POST") {
    try {
      const callbackData = req.body
      const type = callbackData.type
      const action = callbackData.actions.find((action) => action.type === type)
      if (!action) {
        return res.status(400).json({ success: true, error: "Invalid callback data" })
      }

      await supabase
        .from("tbl_transactions")
        .insert({
          merkle_tree: action.info.merkle_tree,
          tree_authority: action.info.tree_authority,
          update_authority: action.info.update_authority,
          nft_address: action.info.nft_address,
          info: action.info,
          type,
        })
        .select()
      res.status(200).json({ success: true, error: "Success" })
    } catch (err: any) {
      console.error(err)

      res.status(500).json({ success: false, error: err?.message })
      return
    }
  } else {
    return res.status(405).json({ success: false, error: "Method not allowed" })
  }
}
