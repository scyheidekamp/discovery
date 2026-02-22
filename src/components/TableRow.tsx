import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIdeas } from "../context/IdeasContext";
import { STATUS_LIST, STATUS_CONFIG } from "../types";
import type { Idea, Status } from "../types";
import RiceScore from "./RiceScore";
import styles from "../styles/TableView.module.css";

interface Props {
  idea: Idea;
  sortDisabled: boolean;
}

export default function TableRow({ idea, sortDisabled }: Props) {
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
    disabled: sortDisabled,
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

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_STATUS",
      payload: { id: idea.id, status: e.target.value as Status },
    });
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${styles.row} ${isDragging ? styles.dragging : ""}`}
      onClick={handleEdit}
    >
      {!sortDisabled && (
        <td>
          <span className={styles.dragHandle} {...attributes} {...listeners}>
            &#x2630;
          </span>
        </td>
      )}
      <td className={styles.titleCell}>{idea.title}</td>
      <td className={styles.numCell}>{idea.reach}</td>
      <td className={styles.numCell}>{idea.impact}</td>
      <td className={styles.numCell}>{idea.confidence}%</td>
      <td className={styles.numCell}>{idea.effort}h</td>
      <td>
        <RiceScore score={idea.riceScore} />
      </td>
      <td>
        <select
          className={styles.statusSelect}
          value={idea.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          style={{ borderLeftColor: STATUS_CONFIG[idea.status].color, borderLeftWidth: 3 }}
        >
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleEdit} title="Edit">
            &#9998;
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            title="Delete"
          >
            &#128465;
          </button>
        </div>
      </td>
    </tr>
  );
}
