"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{ open: boolean }>({ open: false })

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
          const isMobile = window.innerWidth < 768
          const blurValue = isMobile ? '12px' : '8px'
          blur.style.backdropFilter = `blur(${blurValue})`
          ;(blur.style as any).webkitBackdropFilter = `blur(${blurValue})`
          
          blur.style.background = isMobile ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)'
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
  
  return (
    <DialogContext.Provider value={{ open: props.open || false }}>
      <DialogPrimitive.Root data-slot="dialog" modal={false} {...props} />
    </DialogContext.Provider>
  )
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
  const { open } = React.useContext(DialogContext)
  
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      asChild
      forceMount
      {...props}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 z-[49] bg-black/40 backdrop-blur-[8px]", 
              "md:backdrop-blur-[2px] md:bg-black/40", 
              className
            )}
          />
        )}
      </AnimatePresence>
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  variant?: "default" | "bottom"
}) {
  const isBottom = variant === "bottom"
  const { open } = React.useContext(DialogContext)
  
  return (
    <AnimatePresence mode="wait">
      {open && (
        <DialogPortal forceMount>
          <DialogOverlay className="z-[45]" />
          <DialogPrimitive.Content
            data-slot="dialog-content"
            asChild
            forceMount
            {...props}
          >
            <motion.div
              initial={isBottom ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={isBottom ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              transition={isBottom && !open ? {
                duration: 0.2,
                ease: [0.4, 0, 1, 1] 
              } : {
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
              className={cn(
                "bg-[#121214] fixed z-[60] grid w-full gap-4 border shadow-lg outline-none pointer-events-auto", 
                "md:bg-[#121214]/95 md:backdrop-blur-2xl", 
                isBottom 
                  ? "bottom-0 left-0 rounded-t-[2.5rem] p-6 pb-10 max-w-none border-t border-x border-white/10" 
                  : "top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 max-w-[calc(100%-2rem)] rounded-lg p-6 sm:max-w-lg",
                className
              )}
            >
              {isBottom && (
                <div className="mx-auto w-12 h-1.5 rounded-full bg-white/10 mb-2" />
              )}
              {children}
              {showCloseButton && (
                <DialogPrimitive.Close
                  data-slot="dialog-close"
                  className={cn(
                    "ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    isBottom ? "top-6 right-6" : "top-4 right-4"
                  )}
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
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
