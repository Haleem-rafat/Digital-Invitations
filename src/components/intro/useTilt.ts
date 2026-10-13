import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'

const MAX_TILT = 4 // degrees
const GYRO_RANGE = 25 // degrees of phone tilt that map to MAX_TILT
const SPRING = { stiffness: 70, damping: 18, mass: 0.6 }

type OrientationPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Card tilt from the gyroscope (mobile) or mouse (desktop), smoothed with a spring.
 * Also returns light offsets that move the opposite way, so the lighting reacts.
 */
export function useTilt(enabled: boolean) {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotateX = useSpring(targetX, SPRING)
  const rotateY = useSpring(targetY, SPRING)
  const baseline = useRef<number | null>(null)

  // light drifts opposite to the tilt
  const lightX = useTransform(rotateY, (v) => -v * 10)
  const lightY = useTransform(rotateX, (v) => v * 10)
  const glossX = useTransform(rotateY, (v) => -v * 1.6)
  const glossY = useTransform(rotateX, (v) => v * 1.6)

  useEffect(() => {
    if (!enabled) {
      targetX.set(0)
      targetY.set(0)
      return
    }
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))

    const onMouse = (e: MouseEvent) => {
      targetY.set(clamp((e.clientX / window.innerWidth - 0.5) * 2) * MAX_TILT)
      targetX.set(-clamp((e.clientY / window.innerHeight - 0.5) * 2) * MAX_TILT)
    }
    const onLeave = () => {
      targetX.set(0)
      targetY.set(0)
    }
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      baseline.current ??= e.beta // however the phone is held at first = neutral
      targetY.set(clamp(e.gamma / GYRO_RANGE) * MAX_TILT)
      targetX.set(-clamp((e.beta - baseline.current) / GYRO_RANGE) * MAX_TILT)
    }

    window.addEventListener('mousemove', onMouse)
    document.documentElement.addEventListener('mouseleave', onLeave)
    window.addEventListener('deviceorientation', onOrientation)
    return () => {
      window.removeEventListener('mousemove', onMouse)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [enabled, targetX, targetY])

  /** iOS needs a user gesture to grant gyroscope access; call from a pointer handler. */
  const requestGyro = useCallback(() => {
    const DOE = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined
    DOE?.requestPermission?.().catch(() => {})
  }, [])

  return { rotateX, rotateY, lightX, lightY, glossX, glossY, requestGyro }
}
