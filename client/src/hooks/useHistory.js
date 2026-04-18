import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'tb-history-v1';
const MAX_CONVERSATIONS = 50;

function emptyState() {
  return { version: 1, activeId: null, conversations: [] };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.conversations)) {
      return emptyState();
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or unavailable — ignore */
  }
}

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useHistory() {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const active = useMemo(
    () => state.conversations.find((c) => c.id === state.activeId) || null,
    [state.conversations, state.activeId],
  );

  const setActiveId = useCallback((id) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const clearActive = useCallback(() => {
    setState((s) => ({ ...s, activeId: null }));
  }, []);

  const upsertActive = useCallback((mode, patch) => {
    setState((s) => {
      const now = Date.now();
      const existing = s.conversations.find((c) => c.id === s.activeId);
      if (!existing) {
        const id = uid();
        const created = {
          id,
          mode,
          title: patch.title || 'Untitled',
          createdAt: now,
          updatedAt: now,
          messages: patch.messages || [],
          data: patch.data ?? null,
          meta: patch.meta ?? null,
        };
        let conversations = [created, ...s.conversations];
        if (conversations.length > MAX_CONVERSATIONS) {
          conversations = conversations.slice(0, MAX_CONVERSATIONS);
        }
        return { ...s, activeId: id, conversations };
      }
      const updated = { ...existing, ...patch, updatedAt: now };
      const conversations = s.conversations
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => b.updatedAt - a.updatedAt);
      return { ...s, conversations };
    });
  }, []);

  const deleteConversation = useCallback((id) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(emptyState());
  }, []);

  return {
    conversations: state.conversations,
    activeId: state.activeId,
    active,
    setActiveId,
    clearActive,
    upsertActive,
    deleteConversation,
    clearAll,
  };
}
