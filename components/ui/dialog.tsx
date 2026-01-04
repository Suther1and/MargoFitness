"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

// Константы
const BLUR_ANIMATION_DURATION = 200
const BLUR_Z_INDEX = 48

// Глобальный счетчик открытых диалогов
let openDialogsCount = 0
let savedScrollPosition = 0

// Утилиты для работы с navbar blur
const setNavbarBlur = (enabled: boolean) => {
  const navbars = document.querySelectorAll('[data-navbar-container]')
  navbars.forEach(navbar => {
    (navbar as HTMLElement).setAttribute('data-navbar-blur', String(enabled))
  })
}

// Утилиты для компенсации scrollbar
const applyScrollbarCompensation = (scrollbarWidth: number) => {
  if (scrollbarWidth <= 0) return

  document.body.style.paddingRight = `${scrollbarWidth}px`

  const navbar = document.querySelector('[data-navbar-container]') as HTMLElement
  if (navbar) {
    navbar.style.right = `${scrollbarWidth}px`
  }
}

const removeScrollbarCompensation = () => {
  document.body.style.paddingRight = ''

  const navbar = document.querySelector('[data-navbar-container]') as HTMLElement
  if (navbar) navbar.style.right = ''
}

// Утилиты для блокировки скролла
const lockScroll = () => {
  savedScrollPosition = window.scrollY
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  document.documentElement.classList.add('dialog-open')
  document.body.classList.add('dialog-open')

  applyScrollbarCompensation(scrollbarWidth)
}

const unlockScroll = () => {
  document.documentElement.classList.remove('dialog-open')
  document.body.classList.remove('dialog-open')

  removeScrollbarCompensation()

  window.scrollTo(0, savedScrollPosition)
}

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const blurRef = React.useRef<HTMLDivElement | null>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isOpenRef = React.useRef(false)
  
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (props.open && !isOpenRef.current) {
      isOpenRef.current = true
      openDialogsCount++
      
      if (openDialogsCount === 1) {
        lockScroll()
      }

      requestAnimationFrame(() => setNavbarBlur(true))

      // Создаем blur overlay
      const blur = document.createElement('div')
      blur.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: ${BLUR_Z_INDEX};
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        background: rgba(0, 0, 0, 0);
        transition: backdrop-filter 0.2s ease-in-out, background 0.2s ease-in-out;
      `
      blur.setAttribute('data-dialog-blur-overlay', '')
      
      blur.addEventListener('click', (e) => {
        if (e.target === blur && props.onOpenChange) {
          props.onOpenChange(false)
        }
      })
      
      document.body.appendChild(blur)
      blurRef.current = blur
      
      requestAnimationFrame(() => {
        if (blur.parentElement) {
          blur.style.backdropFilter = 'blur(8px)'
          ;(blur.style as any).webkitBackdropFilter = 'blur(8px)'
          blur.style.background = 'rgba(0, 0, 0, 0.3)'
        }
      })
    } else if (!props.open && isOpenRef.current) {
      isOpenRef.current = false
      openDialogsCount = Math.max(0, openDialogsCount - 1)
      
      setNavbarBlur(false)

      if (blurRef.current) {
        const blur = blurRef.current
        blur.style.backdropFilter = 'blur(0px)'
        ;(blur.style as any).webkitBackdropFilter = 'blur(0px)'
        blur.style.background = 'rgba(0, 0, 0, 0)'
        
        timeoutRef.current = setTimeout(() => {
          if (blur && document.body.contains(blur)) {
            document.body.removeChild(blur)
          }
          blurRef.current = null
          timeoutRef.current = null
        }, BLUR_ANIMATION_DURATION)
      }
      
      if (openDialogsCount === 0) {
        unlockScroll()
      }
    }
    
    return () => {
      if (isOpenRef.current) {
        isOpenRef.current = false
        openDialogsCount = Math.max(0, openDialogsCount - 1)
        
        setNavbarBlur(false)
        
        if (openDialogsCount === 0) {
          unlockScroll()
        }
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (blurRef.current && document.body.contains(blurRef.current)) {
        document.body.removeChild(blurRef.current)
        blurRef.current = null
      }
    }
  }, [props.open, props.onOpenChange])
  
  return <DialogPrimitive.Root data-slot="dialog" modal={false} {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed inset-0 z-[49] bg-transparent",
          className
        )}
      />
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className="z-[45]" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-dialog-content="true"
        asChild
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            "bg-background fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[60] grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg outline-none sm:max-w-lg",
            className
          )}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
