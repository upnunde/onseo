"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type BaseModalProps = {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children?: React.ReactNode
  saveLabel?: string
  cancelLabel?: string
  saving?: boolean
  canSave?: boolean
  onSave: () => void | Promise<void>
  className?: string
  cancelButtonClassName?: string
  saveButtonClassName?: string
}

export function BaseModal({
  open,
  onClose,
  title,
  children,
  saveLabel = "저장",
  cancelLabel = "취소",
  saving = false,
  canSave = true,
  onSave,
  className,
  cancelButtonClassName,
  saveButtonClassName,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "rounded-2xl p-6 flex flex-col gap-6 overflow-hidden",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {title ? <DialogTitle>{title}</DialogTitle> : <div />}
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="닫기">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>
        <div className="flex-1 min-h-0">{children}</div>
        <div className="flex items-center justify-end gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={cancelButtonClassName}
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving}
            className={saveButtonClassName}
          >
            {saving ? "저장 중…" : saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

