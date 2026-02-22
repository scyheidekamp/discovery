import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useIdeas } from "../context/IdeasContext";
import type { Idea } from "../types";
import TableRow from "./TableRow";
import styles from "../styles/TableView.module.css";

type SortColumn = "title" | "reach" | "impact" | "confidence" | "effort" | "riceScore" | "status";
type SortDir = "asc" | "desc";

export default function TableView() {
  const { state, dispatch } = useIdeas();
  const isManual = state.sortMode === "manual";

  const [sortCol, setSortCol] = useState<SortColumn>("riceScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const projectIdeas = useMemo(
    () => state.ideas.filter((i) => i.projectId === state.activeProjectId),
    [state.ideas, state.activeProjectId]
  );

  const sortedIdeas = useMemo(() => {
    const ideas = [...projectIdeas];
    if (isManual) {
      return ideas.sort((a, b) => a.order - b.order);
    }
    return ideas.sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [projectIdeas, isManual, sortCol, sortDir]);

  function toggleSort(col: SortColumn) {
    if (isManual) return;
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "title" || col === "status" ? "asc" : "desc");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedIdeas.findIndex((i) => i.id === active.id);
    const newIndex = sortedIdeas.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(sortedIdeas, oldIndex, newIndex).map(
      (idea, idx) => ({ ...idea, order: idx })
    );

    // Merge reordered items back
    const idMap = new Map(reordered.map((i) => [i.id, i]));
    const updated = state.ideas.map((i) => idMap.get(i.id) ?? i);
    dispatch({ type: "REORDER", payload: { ideas: updated } });
  }

  function renderSortHeader(label: string, col: SortColumn) {
    const isActive = !isManual && sortCol === col;
    return (
      <th
        className={!isManual ? styles.sortable : undefined}
        onClick={() => toggleSort(col)}
      >
        {label}
        {isActive && (
          <span className={styles.sortIndicator}>
            {sortDir === "asc" ? "\u25B2" : "\u25BC"}
          </span>
        )}
      </th>
    );
  }

  if (projectIdeas.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyTitle}>No ideas yet</div>
        <div className={styles.emptyText}>
          Click "New Idea" to capture your first product idea.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedIdeas.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                {isManual && <th style={{ width: 40 }}></th>}
                {renderSortHeader("Title", "title")}
                {renderSortHeader("Really, who needs this?", "reach")}
                {renderSortHeader("Impact on WOW factor", "impact")}
                {renderSortHeader("Confidence", "confidence")}
                {renderSortHeader("Effort", "effort")}
                {renderSortHeader("RICE", "riceScore")}
                {renderSortHeader("Status", "status")}
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedIdeas.map((idea) => (
                <TableRow
                  key={idea.id}
                  idea={idea}
                  sortDisabled={!isManual}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}
