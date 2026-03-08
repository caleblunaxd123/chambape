import Link from "next/link"
import { Bell } from "lucide-react"

interface Props {
  count: number
  href: string
}

export function NotificationBell({ count, href }: Props) {
  return (
    <Link href={href} className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
