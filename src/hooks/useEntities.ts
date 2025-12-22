"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId, getCurrentTimestamp } from "@/utils/helpers";
import type { BaseEntity } from "@/types";

/**
 * Generic entity type that extends BaseEntity
 */
export type Entity<T extends object = object> = BaseEntity & T;

/**
 * Options for the useEntities hook
 */
export interface UseEntitiesOptions {
  debounceMs?: number;
}

/**
 * Return type for useEntities hook
 */
export interface UseEntitiesReturn<T extends Entity> {
  entities: T[];
  add: (data: Omit<T, keyof BaseEntity>) => T;
  update: (id: string, data: Partial<Omit<T, keyof BaseEntity>>) => T | null;
  remove: (id: string) => boolean;
  getById: (id: string) => T | undefined;
  clear: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic CRUD hook for managing entity collections with localStorage persistence
 *
 * @param key - The localStorage key for this entity collection
 * @param options - Optional configuration
 * @returns CRUD operations and entity state
 *
 * @example
 * interface Task extends BaseEntity {
 *   title: string;
 *   completed: boolean;
 * }
 *
 * const { entities, add, update, remove } = useEntities<Task>('tasks');
 *
 * add({ title: 'New task', completed: false });
 * update(id, { completed: true });
 * remove(id);
 */
export function useEntities<T extends Entity>(
  key: string,
  options: UseEntitiesOptions = {}
): UseEntitiesReturn<T> {
  const { debounceMs = 300 } = options;

  const [entities, setEntities, { isLoading, error }] = useLocalStorage<T[]>(
    key,
    [],
    debounceMs
  );

  /**
   * Add a new entity with auto-generated id and timestamps
   */
  const add = useCallback(
    (data: Omit<T, keyof BaseEntity>): T => {
      const now = getCurrentTimestamp();
      const newEntity = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as T;

      setEntities((prev) => [...prev, newEntity]);
      return newEntity;
    },
    [setEntities]
  );

  /**
   * Update an existing entity by id
   * Returns the updated entity or null if not found
   */
  const update = useCallback(
    (id: string, data: Partial<Omit<T, keyof BaseEntity>>): T | null => {
      let updatedEntity: T | null = null;

      setEntities((prev) =>
        prev.map((entity) => {
          if (entity.id === id) {
            updatedEntity = {
              ...entity,
              ...data,
              updatedAt: getCurrentTimestamp(),
            };
            return updatedEntity;
          }
          return entity;
        })
      );

      return updatedEntity;
    },
    [setEntities]
  );

  /**
   * Remove an entity by id
   * Returns true if entity was found and removed
   */
  const remove = useCallback(
    (id: string): boolean => {
      let found = false;

      setEntities((prev) => {
        const newEntities = prev.filter((entity) => {
          if (entity.id === id) {
            found = true;
            return false;
          }
          return true;
        });
        return newEntities;
      });

      return found;
    },
    [setEntities]
  );

  /**
   * Get an entity by id
   */
  const getById = useCallback(
    (id: string): T | undefined => {
      return entities.find((entity) => entity.id === id);
    },
    [entities]
  );

  /**
   * Clear all entities
   */
  const clear = useCallback(() => {
    setEntities([]);
  }, [setEntities]);

  return useMemo(
    () => ({
      entities,
      add,
      update,
      remove,
      getById,
      clear,
      isLoading,
      error,
    }),
    [entities, add, update, remove, getById, clear, isLoading, error]
  );
}

export default useEntities;
