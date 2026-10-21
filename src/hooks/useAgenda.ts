import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "../utils/subjectFactory";
import type { AgendaItem } from "../types/academic";

const AGENDA_KEY = "notaminima::agenda";

export type AgendaSortMode = "urgency" | "date" | "subject";

export function useAgenda() {
  const [items, setItems] = useLocalStorage<AgendaItem[]>(AGENDA_KEY, []);

  const addItem = useCallback(
    (item: Omit<AgendaItem, "id" | "isDone">): AgendaItem => {
      const newItem: AgendaItem = {
        ...item,
        id: generateId(),
        isDone: false,
      };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    },
    [setItems],
  );

  const toggleDone = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item)),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<AgendaItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [setItems],
  );

  return { items, addItem, toggleDone, removeItem, updateItem };
}
