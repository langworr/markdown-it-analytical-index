export interface AnalyticalIndexOptions {
  title?: string
  headingLevel?: number
  sortOrder?: "occurrence" | "alphabetical"
}

export interface Term {
  text: string
  slug: string
  occurrences: number
  locations: Array<{
    contextText: string
    depth: number
    contextSlug: string
  }>
}
