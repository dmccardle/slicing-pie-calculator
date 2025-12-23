"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId, getCurrentTimestamp } from "@/utils/helpers";
import type { ActivityEvent, ActivityEventType, ActivityEntityType } from "@/types/slicingPie";

// Storage key for activity events
const ACTIVITY_LOG_KEY = "slicingPie_activityLog";

// Maximum number of events to keep
const MAX_EVENTS = 100;

export interface UseActivityLogReturn {
  events: ActivityEvent[];
  addEvent: (
    type: ActivityEventType,
    entityType: ActivityEntityType,
    entityId: string,
    entityName: string,
    slicesAffected: number,
    cascadeCount?: number
  ) => ActivityEvent;
  getRecentEvents: (limit?: number) => ActivityEvent[];
  clearEvents: () => void;
  isLoading: boolean;
}

/**
 * Hook for managing activity log events (deletions and restorations)
 */
export function useActivityLog(): UseActivityLogReturn {
  const [events, setEvents, { isLoading }] = useLocalStorage<ActivityEvent[]>(
    ACTIVITY_LOG_KEY,
    []
  );

  /**
   * Add a new activity event
   */
  const addEvent = useCallback(
    (
      type: ActivityEventType,
      entityType: ActivityEntityType,
      entityId: string,
      entityName: string,
      slicesAffected: number,
      cascadeCount?: number
    ): ActivityEvent => {
      const newEvent: ActivityEvent = {
        id: generateId(),
        type,
        entityType,
        entityId,
        entityName,
        timestamp: getCurrentTimestamp(),
        slicesAffected,
        cascadeCount,
      };

      setEvents((prev) => {
        // Add new event at the beginning, trim to max events
        const updated = [newEvent, ...prev];
        return updated.slice(0, MAX_EVENTS);
      });

      return newEvent;
    },
    [setEvents]
  );

  /**
   * Get recent events (default: last 10)
   */
  const getRecentEvents = useCallback(
    (limit: number = 10): ActivityEvent[] => {
      return events.slice(0, limit);
    },
    [events]
  );

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, [setEvents]);

  return useMemo(
    () => ({
      events,
      addEvent,
      getRecentEvents,
      clearEvents,
      isLoading,
    }),
    [events, addEvent, getRecentEvents, clearEvents, isLoading]
  );
}

export default useActivityLog;
