import { createClient } from "@/lib/supabase/server"

interface AdPlacementProps {
  position: "header" | "sidebar" | "in-article" | "footer"
}

export async function AdPlacement({ position }: AdPlacementProps) {
  const supabase = await createClient()

  const { data: adPlacement } = await supabase
    .from("ad_placements")
    .select("*")
    .eq("position", position)
    .eq("is_active", true)
    .single()

  if (!adPlacement) return null

  return (
    <div className="ad-placement" data-position={position}>
      <div className="text-center text-xs text-muted-foreground mb-2" aria-label="Advertisement">
        Advertisement
      </div>
      <div dangerouslySetInnerHTML={{ __html: adPlacement.ad_code }} className="flex justify-center" />
    </div>
  )
}
