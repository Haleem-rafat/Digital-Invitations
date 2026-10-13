import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function diff(target: number): Countdown {
  const ms = Math.max(0, target - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    isPast: ms === 0,
  }
}

export function useCountdown(dateISO: string): Countdown {
  const target = new Date(dateISO).getTime()
  const [value, setValue] = useState(() => diff(target))

  useEffect(() => {
    setValue(diff(target))
    const id = window.setInterval(() => setValue(diff(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return value
}
