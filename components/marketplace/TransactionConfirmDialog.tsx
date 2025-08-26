"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

interface TransactionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  loading?: boolean
  txHash?: string
  error?: string
  success?: boolean
}

export function TransactionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
  txHash,
  error,
  success = false,
}: TransactionConfirmDialogProps) {
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
    } catch (err) {
      console.error("[v0] Transaction error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getExplorerUrl = (hash: string) => {
    return `https://chiliscan.com/tx/${hash}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : error ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : loading || isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : null}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {txHash && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 mb-2">{t.marketplace.transactionSubmitted}</p>
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              {t.marketplace.viewOnExplorer}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <DialogFooter>
          {!success && !error && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || isProcessing}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleConfirm} disabled={loading || isProcessing}>
                {loading || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.marketplace.processing}
                  </>
                ) : (
                  t.common.confirm
                )}
              </Button>
            </>
          )}
          {(success || error) && <Button onClick={() => onOpenChange(false)}>{t.common.close}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
