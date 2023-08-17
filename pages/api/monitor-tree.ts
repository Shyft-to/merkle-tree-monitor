import shyftClient from "@/lib/shyft"
import { Network } from "@shyft-to/js"
import { NextApiRequest, NextApiResponse } from "next"

export type BaseResponse = {
  success: boolean
  data?: Object
  error?: string
}

export type RequestBody = {
  tree: string
  network: string
}

interface ExtendedNextApiRequest extends NextApiRequest {
  body: RequestBody
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse<BaseResponse>) {
  if (req.method === "POST") {
    try {
      const treeAddress = req.body.tree
      const network = req.body.network

      if (!treeAddress) return res.status(400).json({ success: false, error: "Missing tree address" })
      if (!network) return res.status(400).json({ success: false, error: "Missing network" })

      await shyftClient.callback.register({
        network: network as Network,
        addresses: [treeAddress],
        callbackUrl: `${process.env.NEXT_PUBLIC_CALLBACK_BASE_URL!}/api/callback`,
      })

      res.status(200).json({ success: true, data: "Registered successfuly" })
    } catch (err: any) {
      console.error(err)

      res.status(500).json({ success: false, error: err?.message })
      return
    }
  } else {
    return res.status(405).json({ success: false, error: "Method not allowed" })
  }
}
