import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useIdeas } from "../context/IdeasContext";
import { STATUS_LIST, type Status, type Idea } from "../types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import styles from "../styles/KanbanBoard.module.css";
import tableStyles from "../styles/TableView.module.css";

export default function KanbanBoard() {
  const { state, dispatch } = useIdeas();
  const [activeCard, setActiveCard] = useState<Idea | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const projectIdeas = useMemo(
    () => state.ideas.filter((i) => i.projectId === state.activeProjectId),
    [state.ideas, state.activeProjectId]
  );

  const ideasByStatus = useMemo(() => {
    const map: Record<Status, Idea[]> = {
      open: [],
      todo: [],
      in_progress: [],
      paused: [],
      testing: [],
      done: [],
    };
    for (const idea of projectIdeas) {
      map[idea.status].push(idea);
    }
    // Sort within each column
    for (const status of STATUS_LIST) {
      if (state.sortMode === "auto") {
        map[status].sort((a, b) => b.riceScore - a.riceScore);
      } else {
        map[status].sort((a, b) => a.order - b.order);
      }
    }
    return map;
  }, [projectIdeas, state.sortMode]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const idea = state.ideas.find((i) => i.id === event.active.id);
      if (idea) setActiveCard(idea);
    },
    [state.ideas]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Determine the target status
      let targetStatus: Status | null = null;

      if (overId.startsWith("column-")) {
        targetStatus = overId.replace("column-", "") as Status;
      } else {
        // Dragging over another card — find that card's status
        const overIdea = state.ideas.find((i) => i.id === overId);
        if (overIdea) targetStatus = overIdea.status;
      }

      if (!targetStatus) return;

      const activeIdea = state.ideas.find((i) => i.id === activeId);
      if (!activeIdea || activeIdea.status === targetStatus) return;

      // Move to new column
      dispatch({
        type: "CHANGE_STATUS",
        payload: { id: activeId, status: targetStatus, newOrder: 9999 },
      });
    },
    [state.ideas, dispatch]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      // If dropped on a column header (empty area), already handled by dragOver
      if (overId.startsWith("column-")) return;

      // Reorder within same column
      const activeIdea = state.ideas.find((i) => i.id === activeId);
      const overIdea = state.ideas.find((i) => i.id === overId);
      if (!activeIdea || !overIdea) return;
      if (activeIdea.status !== overIdea.status) return;

      const columnIdeas = ideasByStatus[activeIdea.status];
      const oldIdx = columnIdeas.findIndex((i) => i.id === activeId);
      const newIdx = columnIdeas.findIndex((i) => i.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove(columnIdeas, oldIdx, newIdx).map(
        (idea, idx) => ({ ...idea, order: idx })
      );

      const idMap = new Map(reordered.map((i) => [i.id, i]));
      const updated = state.ideas.map((i) => idMap.get(i.id) ?? i);
      dispatch({ type: "REORDER", payload: { ideas: updated } });
    },
    [state.ideas, ideasByStatus, dispatch]
  );

  if (projectIdeas.length === 0) {
    return (
      <div className={tableStyles.emptyState}>
        <div className={tableStyles.emptyTitle}>No ideas yet</div>
        <div className={tableStyles.emptyText}>
          Click "New Idea" to capture your first product idea.
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {STATUS_LIST.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            ideas={ideasByStatus[status]}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <KanbanCard idea={activeCard} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
