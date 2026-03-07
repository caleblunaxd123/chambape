import type {
  User,
  ProfessionalProfile,
  ServiceCategory,
  ServiceSubcategory,
  ServiceRequest,
  ServiceApplication,
  Review,
  CreditPackage,
  CreditTransaction,
  PortfolioImage,
  Badge,
  Notification,
  ProfessionalCategory,
  ProfessionalBadge,
} from "@prisma/client"

// ─── Re-exports limpios ────────────────────────────────────────────
export type {
  User,
  ProfessionalProfile,
  ServiceCategory,
  ServiceSubcategory,
  ServiceRequest,
  ServiceApplication,
  Review,
  CreditPackage,
  CreditTransaction,
  PortfolioImage,
  Badge,
  Notification,
}

// ─── Tipos compuestos ─────────────────────────────────────────────

export type UserWithProfile = User & {
  professionalProfile: ProfessionalProfile | null
}

export type ProfessionalWithDetails = ProfessionalProfile & {
  user: User
  categories: (ProfessionalCategory & { category: ServiceCategory })[]
  portfolioImages: PortfolioImage[]
  badges: (ProfessionalBadge & { badge: Badge })[]
  reviewsReceived: Review[]
}

export type RequestWithDetails = ServiceRequest & {
  client: User
  category: ServiceCategory
  subcategory: ServiceSubcategory | null
  applications: (ServiceApplication & {
    professional: ProfessionalProfile & { user: User }
  })[]
  review: Review | null
}

export type ApplicationWithDetails = ServiceApplication & {
  request: RequestWithDetails
  professional: ProfessionalProfile & { user: User }
  review: Review | null
}

export type NotificationWithMeta = Notification & {
  metadata: {
    requestId?: string
    rating?: number
    motivo?: string
  } | null
}

// ─── API Response types ───────────────────────────────────────────

export interface ApiError {
  error: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
