"use client"

import { getBadge } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Props {
  totalJobs: number
  avgRating: number
  size?: "sm" | "md" | "lg"
  showDescription?: boolean
  className?: string
}

export function BadgeNivel({
  totalJobs,
  avgRating,
  size = "sm",
  showDescription = false,
  className,
}: Props) {
  const badge = getBadge(totalJobs, avgRating)

  if (size === "sm") {
    return (
      <span
        title={badge.description}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
          badge.bg, badge.text, badge.border,
          className
        )}
      >
        <span>{badge.emoji}</span>
        {badge.label}
      </span>
    )
  }

  if (size === "md") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-medium text-sm",
          badge.bg, badge.text, badge.border,
          className
        )}
      >
        <span className="text-base">{badge.emoji}</span>
        <div>
          <span className="font-bold">{badge.label}</span>
          {showDescription && (
            <p className="text-xs opacity-75 font-normal leading-tight mt-0.5">
              {badge.description}
            </p>
          )}
        </div>
      </div>
    )
  }

  // lg — tarjeta de perfil
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border-2",
        badge.bg, badge.border,
        className
      )}
    >
      <span className="text-3xl">{badge.emoji}</span>
      <div>
        <p className={cn("font-bold text-base leading-tight", badge.text)}>
          Nivel {badge.label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
      </div>
    </div>
  )
}
