export class RateLimit {
  private timestamps: Map<string, number[]>
  private readonly limit: number
  private readonly window: number

  constructor(limit: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.timestamps = new Map()
    this.limit = limit
    this.window = windowMs
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now()
    const timestamps = this.timestamps.get(ip) || []
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(timestamp => 
      now - timestamp < this.window
    )
    
    if (validTimestamps.length >= this.limit) {
      return true
    }
    
    validTimestamps.push(now)
    this.timestamps.set(ip, validTimestamps)
    return false
  }

  getTimeUntilReset(ip: string): number {
    const timestamps = this.timestamps.get(ip) || []
    if (timestamps.length === 0) return 0
    
    const oldestTimestamp = Math.min(...timestamps)
    return Math.max(0, this.window - (Date.now() - oldestTimestamp))
  }
}

export const rateLimiter = new RateLimit()