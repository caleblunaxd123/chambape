"use client"

import { useEffect } from "react"

export function SWRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((reg) => console.log("SW registrado:", reg.scope))
          .catch((err) => console.error("SW falló:", err))
      })
    }
  }, [])

  return null
}
