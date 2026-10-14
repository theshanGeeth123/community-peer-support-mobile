import { useEffect, useRef } from "react";

import { Accelerometer } from "expo-sensors";

/*
 * Tuning:
 * - A phone at rest reads ~1 g. A deliberate shake easily passes 2.3 g,
 *   walking or putting the phone down does not.
 * - Two jolts within SHAKE_WINDOW_MS count as one shake, so a single
 *   bump (dropping it on a bed) never triggers.
 * - After a shake, nothing triggers again for COOLDOWN_MS.
 */
const SHAKE_THRESHOLD_G = 2.3;
const REQUIRED_JOLTS = 2;
const SHAKE_WINDOW_MS = 800;
const COOLDOWN_MS = 2500;
const UPDATE_INTERVAL_MS = 100;

/**
 * Calls onShake when the device is shaken.
 * Does nothing on devices without an accelerometer (e.g. web).
 */
export function useShakeDetector(onShake: () => void, enabled = true) {
  /*
   * Keep the latest callback without re-subscribing to the sensor
   * on every render.
   */
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    let joltTimes: number[] = [];
    let lastShakeAt = 0;

    const start = async () => {
      const available = await Accelerometer.isAvailableAsync().catch(
        () => false
      );

      if (!available || cancelled) {
        return;
      }

      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const now = Date.now();

        if (now - lastShakeAt < COOLDOWN_MS) {
          return;
        }

        const force = Math.sqrt(x * x + y * y + z * z);

        if (force < SHAKE_THRESHOLD_G) {
          return;
        }

        joltTimes = [
          ...joltTimes.filter((time) => now - time < SHAKE_WINDOW_MS),
          now,
        ];

        if (joltTimes.length >= REQUIRED_JOLTS) {
          joltTimes = [];
          lastShakeAt = now;
          onShakeRef.current();
        }
      });
    };

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);
}
