import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/typography"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import { BaseResponse } from "./api/monitor-tree"
import { TransactionType } from "@/types"
import dayjs from "dayjs"

const formSchema = z.object({
  merkleAddrress: z.string().trim().min(1, "This field is required."),
  network: z.string().trim().min(1, "This field is required."),
})

export default function HomePage() {
  const [events, setEvents] = useState<TransactionType[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merkleAddrress: "",
      network: "devnet",
    },
  })

  const { control, formState, reset } = form

  const { toast } = useToast()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values)
    try {
      const result = await fetch("/api/monitor-tree", {
        headers: {
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          tree: values.merkleAddrress,
          network: values.network,
        }),
      }).then((res) => res.json() as Promise<BaseResponse>)

      if (!result.success) {
        throw new Error(result.error ?? "Unknown error")
      }

      toast({
        variant: "success",
        title: "Callback registered successfully.",
      })
      reset()
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "error",
        title: error?.message || "Server error",
      })
    }
  }

  useEffect(() => {
    supabase
      .channel("any")
      .on("postgres_changes", { event: "*", schema: "public", table: "tbl_transactions" }, (payload) => {
        console.log("Change received!", payload)
        setEvents((events: TransactionType[]) => [payload.new as TransactionType, ...(events ?? [])])
      })
      .subscribe()
  }, [setEvents])

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto my-20 flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-gray-800 p-6 shadow-card"
        >
          <Typography as="h2" level="h6" className="font-bold">
            Merkle Tree Monitor
          </Typography>
          <div className="flex flex-col gap-4">
            <FormField
              control={control}
              name="merkleAddrress"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Merkle address</FormLabel>
                  <FormControl>
                    <Input fullWidth {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="network"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Network</FormLabel>
                  <FormControl>
                    <select
                      id="countries"
                      className="block w-full rounded-lg border-[2px] border-primary-300 bg-transparent p-2.5 outline-none focus:border-primary-500 focus:ring-primary-500"
                      {...field}
                    >
                      <option selected>Choose a network</option>
                      <option value="mainnet-beta">Mainnet</option>
                      <option value="testnet">Testnet</option>
                      <option value="devnet">Devnet</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button loading={formState.isSubmitting} type="submit">
            Register
          </Button>
        </form>
      </Form>

      <div className="mx-auto mt-10 max-w-2xl space-y-6">
        {events.map((event) => (
          <TransactionCard key={event.id} transaction={event} />
        ))}
      </div>
    </>
  )
}

const TransactionCard = ({ transaction }: { transaction: TransactionType }) => {
  return (
    <div className="flex w-full flex-col gap-4  rounded-2xl bg-gray-800 p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <Typography color="success" className="font-semibold">
          {transaction.type.replaceAll("_", " ")}
        </Typography>
        <Typography color="secondary" level="body5">
          {dayjs().to(dayjs(transaction.created_at))}
        </Typography>
      </div>

      {transaction.type === "COMPRESSED_NFT_MINT" && (
        <>
          <Typography className="font-semibold">{transaction.info.nft_metadata.name}</Typography>
          <Typography className="font-semibold">
            Mint to : <span className="text-sm font-normal">{transaction.info.owner}</span>
          </Typography>
          <Typography className="font-semibold">
            Merkle tree : <span className="text-sm font-normal">{transaction.merkle_tree}</span>
          </Typography>
        </>
      )}

      {transaction.type === "COMPRESSED_NFT_BURN" && (
        <>
          <Typography className="font-semibold">{transaction.nft_address}</Typography>
          <Typography className="font-semibold">Burned 🔥</Typography>
        </>
      )}

      {transaction.type === "COMPRESSED_NFT_TRANSFER" && (
        <>
          <Typography className="font-semibold">{transaction.nft_address}</Typography>
          <Typography className="font-semibold">
            Sender : <span className="text-sm font-normal">{transaction.info.sender}</span>
          </Typography>
          <Typography className="font-semibold">
            Receiver : <span className="text-sm font-normal">{transaction.info.receiver}</span>
          </Typography>
        </>
      )}

      {transaction.type === "COMPRESSED_NFT_SALE" && (
        <>
          <Typography className="font-semibold">{transaction.nft_address}</Typography>
          <Typography className="font-semibold">
            Sold by : <span className="text-sm font-normal">{transaction.info.seller}</span>
          </Typography>
          <Typography className="font-semibold">
            Sold to : <span className="text-sm font-normal">{transaction.info.buyer}</span>
          </Typography>
          <Typography className="font-semibold">
            Price : <span className="text-sm font-normal">{transaction.info.price} SOL</span>
          </Typography>
        </>
      )}

      {transaction.type === "COMPRESSED_NFT_LIST" && (
        <>
          <Typography className="font-semibold">{transaction.nft_address}</Typography>
          <Typography className="font-semibold">
            List to : <span className="text-sm font-normal">{transaction.info.marketplace}</span>
          </Typography>
          <Typography className="font-semibold">
            List by : <span className="text-sm font-normal">{transaction.info.seller}</span>
          </Typography>
          <Typography className="font-semibold">
            Price : <span className="text-sm font-normal">{transaction.info.price} SOL</span>
          </Typography>
        </>
      )}

      {transaction.type === "COMPRESSED_NFT_BID" && (
        <>
          <Typography className="font-semibold">{transaction.nft_address}</Typography>
          <Typography className="font-semibold">
            Bid by : <span className="text-sm font-normal">{transaction.info.bidder}</span>
          </Typography>
          <Typography className="font-semibold">
            Price : <span className="text-sm font-normal">{transaction.info.price} SOL</span>
          </Typography>
        </>
      )}
    </div>
  )
}
