import { useIdeas } from "../context/IdeasContext";
import type { ViewMode, SortMode } from "../types";
import styles from "../styles/Header.module.css";

export default function Header() {
  const { state, dispatch } = useIdeas();

  const activeProject = state.activeProjectId
    ? state.projects.find((p) => p.id === state.activeProjectId)
    : null;

  // Landing page header
  if (!activeProject) {
    return (
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>~ discovery</h1>
          <span className={styles.subtitle}>// prioritizing scy's ideas</span>
        </div>
      </header>
    );
  }

  // Project board header
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <button
          className={styles.backBtn}
          onClick={() => dispatch({ type: "SET_ACTIVE_PROJECT", payload: null })}
          title="Back to projects"
        >
          ←
        </button>
        <h1 className={styles.title}>{activeProject.name}</h1>
      </div>

      <div className={styles.controls}>
        <div className={styles.toggleGroup}>
          {(["table", "kanban"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`${styles.toggleBtn} ${state.viewMode === mode ? styles.toggleBtnActive : ""}`}
              onClick={() => dispatch({ type: "SET_VIEW_MODE", payload: mode })}
            >
              {mode === "table" ? "Table" : "Kanban"}
            </button>
          ))}
        </div>

        <div className={styles.separator} />

        <div className={styles.toggleGroup}>
          {(["auto", "manual"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              className={`${styles.toggleBtn} ${state.sortMode === mode ? styles.toggleBtnActive : ""}`}
              onClick={() => dispatch({ type: "SET_SORT_MODE", payload: mode })}
            >
              {mode === "auto" ? "RICE Sort" : "Manual"}
            </button>
          ))}
        </div>

        <div className={styles.separator} />

        <button
          className={styles.newBtn}
          onClick={() => dispatch({ type: "SET_SHOW_FORM", payload: true })}
        >
          + New Idea
        </button>
      </div>
    </header>
  );
}
