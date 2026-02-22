import type { Project } from "../types";
import { useIdeas } from "../context/IdeasContext";
import styles from "../styles/ProjectCard.module.css";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const { state, dispatch } = useIdeas();

  const projectIdeas = state.ideas.filter((i) => i.projectId === project.id);
  const ideaCount = projectIdeas.length;
  const avgRice =
    ideaCount > 0
      ? Math.round(
          projectIdeas.reduce((sum, i) => sum + i.riceScore, 0) / ideaCount
        )
      : 0;

  function handleClick() {
    dispatch({ type: "SET_ACTIVE_PROJECT", payload: project.id });
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: "SET_EDITING_PROJECT", payload: project });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: "SET_DELETE_PROJECT_CONFIRM", payload: project.id });
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={handleEdit} title="Edit">
          ✎
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={handleDelete}
          title="Delete"
        >
          ✕
        </button>
      </div>

      <div className={styles.name}>{project.name}</div>
      <div className={styles.description}>
        {project.description || "No description"}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Ideas</span>
          <span className={styles.statValue}>{ideaCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg RICE</span>
          <span className={styles.statValue}>{avgRice}</span>
        </div>
      </div>
    </div>
  );
}
