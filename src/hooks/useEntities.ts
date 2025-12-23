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
 * Soft deletable entity interface
 */
export interface SoftDeletableEntity {
  deletedAt?: string;
  deletedWithParent?: string;
}

/**
 * Return type for useEntities hook
 */
export interface UseEntitiesReturn<T extends Entity> {
  entities: T[];
  add: (data: Omit<T, keyof BaseEntity>) => T;
  update: (id: string, data: Partial<Omit<T, keyof BaseEntity>>) => T | null;
  remove: (id: string) => boolean;
  softDelete: (id: string, parentId?: string) => boolean;
  restore: (id: string) => boolean;
  getById: (id: string) => T | undefined;
  getActive: () => T[];
  getDeleted: () => T[];
  clear: () => void;
  setAll: (entities: T[]) => void;
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
   * Remove an entity by id (hard delete)
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
   * Soft delete an entity by id (sets deletedAt timestamp)
   * @param id - Entity ID to soft delete
   * @param parentId - Optional parent ID for cascade deletions
   * Returns true if entity was found and soft-deleted
   */
  const softDelete = useCallback(
    (id: string, parentId?: string): boolean => {
      let found = false;

      setEntities((prev) =>
        prev.map((entity) => {
          if (entity.id === id && !(entity as T & SoftDeletableEntity).deletedAt) {
            found = true;
            return {
              ...entity,
              deletedAt: getCurrentTimestamp(),
              ...(parentId ? { deletedWithParent: parentId } : {}),
              updatedAt: getCurrentTimestamp(),
            };
          }
          return entity;
        })
      );

      return found;
    },
    [setEntities]
  );

  /**
   * Restore a soft-deleted entity by id (clears deletedAt)
   * Returns true if entity was found and restored
   */
  const restore = useCallback(
    (id: string): boolean => {
      let found = false;

      setEntities((prev) =>
        prev.map((entity) => {
          if (entity.id === id && (entity as T & SoftDeletableEntity).deletedAt) {
            found = true;
            const { deletedAt: _deletedAt, deletedWithParent: _deletedWithParent, ...rest } = entity as T & SoftDeletableEntity;
            return {
              ...rest,
              updatedAt: getCurrentTimestamp(),
            } as T;
          }
          return entity;
        })
      );

      return found;
    },
    [setEntities]
  );

  /**
   * Get all active (non-deleted) entities
   */
  const getActive = useCallback((): T[] => {
    return entities.filter((entity) => !(entity as T & SoftDeletableEntity).deletedAt);
  }, [entities]);

  /**
   * Get all soft-deleted entities
   */
  const getDeleted = useCallback((): T[] => {
    return entities.filter((entity) => !!(entity as T & SoftDeletableEntity).deletedAt);
  }, [entities]);

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

  /**
   * Replace all entities with a new array (for bulk import)
   * This avoids the race condition of clear + multiple adds
   */
  const setAll = useCallback(
    (newEntities: T[]) => {
      setEntities(newEntities);
    },
    [setEntities]
  );

  return useMemo(
    () => ({
      entities,
      add,
      update,
      remove,
      softDelete,
      restore,
      getById,
      getActive,
      getDeleted,
      clear,
      setAll,
      isLoading,
      error,
    }),
    [entities, add, update, remove, softDelete, restore, getById, getActive, getDeleted, clear, setAll, isLoading, error]
  );
}

export default useEntities;
