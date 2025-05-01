"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slippage: number
  onSlippageChange: (slippage: number) => void
  deadline: number
  onDeadlineChange: (deadline: number) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  slippage,
  onSlippageChange,
  deadline,
  onDeadlineChange,
}: SettingsDialogProps) {
  const [customSlippage, setCustomSlippage] = useState("")
  const [customDeadline, setCustomDeadline] = useState("")

  const handleSlippageChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomSlippage(value)
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
        onSlippageChange(numValue)
      }
    }
  }

  const handleDeadlineChange = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setCustomDeadline(value)
      const numValue = Number.parseInt(value)
      if (!isNaN(numValue) && numValue > 0) {
        onDeadlineChange(numValue)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Transaction Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">Slippage Tolerance</Label>
            <div className="flex gap-2">
              <Button
                variant={slippage === 0.1 ? "default" : "outline"}
                className={`flex-1 ${slippage === 0.1 ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => onSlippageChange(0.1)}
              >
                0.1%
              </Button>
              <Button
                variant={slippage === 0.5 ? "default" : "outline"}
                className={`flex-1 ${slippage === 0.5 ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => onSlippageChange(0.5)}
              >
                0.5%
              </Button>
              <Button
                variant={slippage === 1.0 ? "default" : "outline"}
                className={`flex-1 ${slippage === 1.0 ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => onSlippageChange(1.0)}
              >
                1.0%
              </Button>
              <div className="relative flex-1">
                <Input
                  value={customSlippage}
                  onChange={(e) => handleSlippageChange(e.target.value)}
                  placeholder={slippage.toString()}
                  className="pr-8 bg-secondary border-primary/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[slippage]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(value) => onSlippageChange(value[0])}
              className="py-2"
            />
            <p className="text-sm text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">Transaction Deadline</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={customDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                placeholder={deadline.toString()}
                className="w-20 bg-secondary border-primary/20"
              />
              <span className="text-muted-foreground">minutes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your transaction will revert if it is pending for longer than this time.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
