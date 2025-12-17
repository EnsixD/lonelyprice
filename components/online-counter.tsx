"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return ""
    const stored = localStorage.getItem("lonely-price-session-id")
    if (stored) return stored

    // Create unique fingerprint based on browser characteristics
    const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}`
    const hash = fingerprint.split("").reduce((acc, char) => {
      const chr = char.charCodeAt(0)
      return (acc << 5) - acc + chr
    }, 0)
    const id = `browser-${Math.abs(hash)}-${Date.now()}`
    localStorage.setItem("lonely-price-session-id", id)
    return id
  })

  useEffect(() => {
    if (!sessionId) return

    const supabase = createClient()

    const updatePresence = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        await supabase.from("online_presence").upsert(
          {
            session_id: sessionId,
            user_id: user?.id || null,
            last_seen: new Date().toISOString(),
            page_url: window.location.pathname,
          },
          {
            onConflict: "session_id",
          },
        )
      } catch (error) {
        console.error("[v0] Error updating presence:", error)
      }
    }

    const countOnlineUsers = async () => {
      try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

        const { count, error } = await supabase
          .from("online_presence")
          .select("*", { count: "exact", head: true })
          .gte("last_seen", twoMinutesAgo)

        if (error) {
          console.error("[v0] Error counting online users:", error)
        } else {
          setOnlineCount(count || 0)
        }
      } catch (error) {
        console.error("[v0] Error in countOnlineUsers:", error)
      }
    }

    // Initial update
    updatePresence().then(() => countOnlineUsers())

    // Update presence every 30 seconds
    const presenceInterval = setInterval(updatePresence, 30000)
    // Count online users every 10 seconds
    const countInterval = setInterval(countOnlineUsers, 10000)

    // Subscribe to real-time changes
    const channel = supabase
      .channel("online-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "online_presence" }, () => {
        countOnlineUsers()
      })
      .subscribe()

    // Cleanup on unmount
    return () => {
      clearInterval(presenceInterval)
      clearInterval(countInterval)
      channel.unsubscribe()
      // Delete session when leaving
      supabase.from("online_presence").delete().eq("session_id", sessionId).then()
    }
  }, [sessionId])

  return (
    <Badge variant="secondary" className="gap-2 transition-smooth cursor-default">
      <Users className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-medium">
        {onlineCount} {onlineCount === 1 ? "онлайн" : "онлайн"}
      </span>
    </Badge>
  )
}
