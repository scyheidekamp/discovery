import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { STATUS_CONFIG } from "../types";
import type { Idea, Status } from "../types";
import KanbanCard from "./KanbanCard";
import styles from "../styles/KanbanBoard.module.css";

interface Props {
  status: Status;
  ideas: Idea[];
}

export default function KanbanColumn({ status, ideas }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  const config = STATUS_CONFIG[status];

  return (
    <div className={`${styles.column} ${isOver ? styles.columnOver : ""}`}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>
          <span
            className={styles.statusDot}
            style={{ background: config.color }}
          />
          {config.label}
        </span>
        <span className={styles.columnCount}>{ideas.length}</span>
      </div>
      <div ref={setNodeRef} className={styles.columnBody}>
        <SortableContext
          items={ideas.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {ideas.length === 0 ? (
            <div className={styles.emptyColumn}>Drop here</div>
          ) : (
            ideas.map((idea) => <KanbanCard key={idea.id} idea={idea} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
