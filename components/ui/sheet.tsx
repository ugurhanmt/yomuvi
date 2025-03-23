"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SheetContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null)

export const Sheet = ({ 
  children, 
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: { 
  children: any; 
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  
  const setOpen = React.useCallback((openState: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(openState)
    }
    onOpenChange?.(openState)
  }, [isControlled, onOpenChange])

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const useSheetContext = () => {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("useSheetContext must be used within a Sheet")
  }
  return context
}

export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    asChild?: boolean;
  }
>(({ children, asChild = false, ...props }, ref) => {
  const { setOpen } = useSheetContext()
  
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp 
      ref={ref}
      onClick={(e) => {
        props.onClick?.(e)
        setOpen(true)
      }}
      {...props}
    >
      {children}
    </Comp>
  )
})

SheetTrigger.displayName = "SheetTrigger"

export const SheetContent = ({ 
  children, 
  side = "right", 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) => {
  const { open, setOpen } = useSheetContext()

  const sideMap = {
    top: "inset-x-0 top-0 rounded-b-lg",
    right: "inset-y-0 right-0 h-full rounded-l-lg",
    bottom: "inset-x-0 bottom-0 rounded-t-lg",
    left: "inset-y-0 left-0 h-full rounded-r-lg",
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        className={cn(
          "fixed bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          sideMap[side],
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        )}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        {children}
      </div>
    </div>
  )
}

export const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)

export const SheetTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
}) => (
  <div
    className={cn(
      "text-lg font-semibold text-foreground",
      className
    )}
    {...props}
  />
)
