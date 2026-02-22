import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIdeas } from "../context/IdeasContext";
import type { Idea } from "../types";
import RiceScore from "./RiceScore";
import styles from "../styles/KanbanCard.module.css";

interface Props {
  idea: Idea;
  overlay?: boolean;
}

export default function KanbanCard({ idea, overlay }: Props) {
  const { dispatch } = useIdeas();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.id,
    data: { type: "card", idea },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: "SET_EDITING", payload: idea });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: "SET_DELETE_CONFIRM", payload: idea.id });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ""} ${overlay ? styles.dragOverlay : ""}`}
      {...attributes}
      {...listeners}
      onClick={handleEdit}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>{idea.title}</span>
        <RiceScore score={idea.riceScore} />
      </div>
      {idea.description && (
        <div className={styles.cardDesc}>{idea.description}</div>
      )}
      <div className={styles.cardActions}>
        <button className={styles.cardActionBtn} onClick={handleEdit} title="Edit">
          &#9998;
        </button>
        <button
          className={`${styles.cardActionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          title="Delete"
        >
          &#128465;
        </button>
      </div>
    </div>
  );
}
