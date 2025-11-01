"use client"

import type React from "react"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type TokenRow = {
  value: string
  hash: string
  expiresAt: string | null
  createdAt: string
  expired: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TokenGenerator() {
  const [value, setValue] = useState("")
  const [expiry, setExpiry] = useState("one-day")
  const [generated, setGenerated] = useState<{ hash: string; expiresAt: string | null; createdAt: string } | null>(null)

  const [checkHash, setCheckHash] = useState("")
  const [verifyResult, setVerifyResult] = useState<null | { found: boolean; expired: boolean | null; token?: any }>(
    null,
  )

  const { data, isLoading } = useSWR<TokenRow[]>("/api/tokens", fetcher, { refreshInterval: 5000 })

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expiry }),
    })
    if (!res.ok) {
      alert("Failed to generate")
      return
    }
    const j = await res.json()
    setGenerated(j)
    setValue("")
    await mutate("/api/tokens")
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    const url = `/api/verify?hash=${encodeURIComponent(checkHash)}`
    const res = await fetch(url)
    const j = await res.json()
    setVerifyResult(j)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Create Expiring Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onGenerate} className="flex flex-col md:flex-row gap-4 items-start space-y-2">
            <div className="w-full flex flex-col gap-2 md:max-w-xs">
              <Label>Expiry</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-day">One day</SelectItem>
                  <SelectItem value="one-month">One month</SelectItem>
                  <SelectItem value="one-year">One year</SelectItem>
                  <SelectItem value="infinite">Infinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              <Button type="submit">Generate</Button>
            </div>
          </form>

          {generated && (
            <div className="mt-4 text-sm flex flex-col gap-2 items-start">
              <div>
                <span className="font-medium">Hash:</span> {generated.hash}
              </div>
              <div>
                <span className="font-medium">Expires:</span>{" "}
                {generated.expiresAt ? new Date(generated.expiresAt).toLocaleString() : "Never"}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(generated.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Verify Hash</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerify} className="flex gap-4 items-end">
            <div className="w-full md:max-w-lg">
              <Label htmlFor="hash">Hash</Label>
              <Input
                id="hash"
                value={checkHash}
                onChange={(e) => setCheckHash(e.target.value)}
                placeholder="Paste a hash..."
              />
            </div>
            <Button type="submit">Verify</Button>
          </form>
          {verifyResult && (
            <div className="mt-4 text-sm">
              {!verifyResult.found && <div className="text-red-600">Hash not found.</div>}
              {verifyResult.found && (
                <div className={verifyResult.expired ? "text-red-600" : "text-green-600"}>
                  {verifyResult.expired ? "Expired" : "Valid (not expired)"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Latest Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cup ID</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                )}
                {!isLoading && data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No tokens yet</TableCell>
                  </TableRow>
                )}
                {data?.map((t) => (
                  <TableRow key={t.hash}>
                    <TableCell className="max-w-[240px] truncate">{t.value}</TableCell>
                    <TableCell className="font-mono max-w-[380px] truncate">{t.hash}</TableCell>
                    <TableCell>{t.expiresAt ? new Date(t.expiresAt).toLocaleString() : "Never"}</TableCell>
                    <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                    <TableCell className={t.expired ? "text-red-600" : "text-green-600"}>
                      {t.expired ? "Expired" : "Active"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
