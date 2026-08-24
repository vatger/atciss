import { useCallback, useState } from "react"
import { localStorageOrDefault, setLocalStorage } from "app/utils"
import { generateRcc } from "services/rccGenerator"
import {
  DraftRunwayCondition,
  DraftRunwayConditions,
  RccMode,
  RunwayCondition,
  RunwayZone,
} from "types/rcc"

const MODE_STORAGE_KEY = "rcc.mode"

export function useRccState() {
  const [icao, setIcao] = useState<string | null>(null)
  const [selectedRunways, setSelectedRunways] = useState<string[]>([])
  const [conditions, setConditions] = useState<
    Record<string, DraftRunwayConditions>
  >({})
  const [submitted, setSubmitted] = useState(false)
  const [conditionString, setConditionString] = useState<string | null>(null)
  const [storedMode, setStoredMode] = useState<RccMode>(() =>
    localStorageOrDefault(MODE_STORAGE_KEY, "ez" as RccMode),
  )

  const selectAirport = useCallback((newIcao: string | null) => {
    setIcao(newIcao)
    setSelectedRunways([])
    setConditions({})
    setConditionString(null)
    setSubmitted(false)
  }, [])

  const toggleRunway = useCallback((designator: string, siblings: string[]) => {
    setSelectedRunways((prev) => {
      const withoutSiblings = prev.filter((r) => !siblings.includes(r))
      return prev.includes(designator)
        ? withoutSiblings
        : [...withoutSiblings, designator]
    })
  }, [])

  const setCondition = useCallback(
    (runway: string, zone: RunwayZone, updates: DraftRunwayCondition) => {
      setConditions((prev) => {
        const existingZone = prev[runway]?.[zone] ?? {}
        const nextZone: DraftRunwayCondition = { ...existingZone, ...updates }

        if (updates.conditionCode !== undefined) {
          if (Number(updates.conditionCode) === 6) {
            nextZone.deposit = "dry"
            nextZone.coverage = 100
          } else if (
            existingZone.deposit === "dry" &&
            existingZone.coverage === 100
          ) {
            delete nextZone.deposit
            delete nextZone.coverage
          }
        }

        return {
          ...prev,
          [runway]: { ...prev[runway], [zone]: nextZone },
        }
      })
    },
    [],
  )

  const setEasyCondition = useCallback(
    (runway: string, condition: RunwayCondition) => {
      setConditions((prev) => ({
        ...prev,
        [runway]: {
          tdz: condition,
          mid: { ...condition },
          end: { ...condition },
        },
      }))
    },
    [],
  )

  const clearConditions = useCallback(() => {
    setConditions({})
    setConditionString(null)
    setSubmitted(false)
  }, [])

  const setMode = useCallback((value: RccMode) => {
    setStoredMode(setLocalStorage(MODE_STORAGE_KEY, value))
    setConditions({})
    setConditionString(null)
    setSubmitted(false)
  }, [])

  const generate = useCallback(() => {
    setSubmitted(true)
    const activeConditions = Object.fromEntries(
      selectedRunways
        .filter((runway) => conditions[runway] !== undefined)
        .map((runway) => [runway, conditions[runway]]),
    )
    const result = generateRcc(activeConditions)
    setConditionString(result && result.trim().length > 0 ? result : null)
  }, [conditions, selectedRunways])

  return {
    icao,
    selectedRunways,
    conditions,
    submitted,
    conditionString,
    mode: storedMode,
    selectAirport,
    toggleRunway,
    setCondition,
    setEasyCondition,
    clearConditions,
    setMode,
    generate,
  }
}

export type RccState = ReturnType<typeof useRccState>
