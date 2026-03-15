import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg"
  variant?: "light" | "dark"
  href?: string
  className?: string
  showText?: boolean
}

const sizeConfig = {
  xs: { box: "w-6 h-6 rounded-md text-xs", text: "text-sm" },
  sm: { box: "w-8 h-8 rounded-lg text-sm", text: "text-base" },
  md: { box: "w-10 h-10 rounded-xl text-base", text: "text-xl" },
  lg: { box: "w-14 h-14 rounded-2xl text-xl", text: "text-3xl" },
}

export function Logo({
  size = "sm",
  variant = "light",
  href,
  className,
  showText = true,
}: LogoProps) {
  const { box, text } = sizeConfig[size]

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          box,
          "flex items-center justify-center flex-shrink-0",
          "bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"
        )}
      >
        <span className="text-white font-black leading-none">C</span>
      </div>
      {showText && (
        <span
          className={cn(
            text,
            "font-black tracking-tight leading-none",
            variant === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Chamba<span className="text-orange-500">Pe</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
