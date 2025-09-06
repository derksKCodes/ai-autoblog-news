async function runRSSCron() {
  console.log("[v0] Starting RSS cron job...")

  try {
    // Call the RSS fetch API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/rss/fetch`, {
      method: "GET",
    })

    const result = await response.json()

    if (result.success) {
      console.log(`[v0] RSS cron completed successfully. Processed ${result.results.length} sources.`)
      console.log("[v0] Results:", result.results)
    } else {
      console.error("[v0] RSS cron failed:", result.error)
    }
  } catch (error) {
    console.error("[v0] RSS cron error:", error)
  }
}

// Run if called directly
if (require.main === module) {
  runRSSCron()
}

export { runRSSCron }
