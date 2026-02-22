import { useIdeas } from "../context/IdeasContext";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import ConfirmDialog from "./ConfirmDialog";
import styles from "../styles/ProjectsPage.module.css";

export default function ProjectsPage() {
  const { state, dispatch } = useIdeas();

  const projectToDelete = state.deleteProjectConfirm
    ? state.projects.find((p) => p.id === state.deleteProjectConfirm)
    : null;

  const ideaCountForDelete = projectToDelete
    ? state.ideas.filter((i) => i.projectId === projectToDelete.id).length
    : 0;

  function handleAddProject() {
    dispatch({ type: "SET_SHOW_PROJECT_FORM", payload: true });
  }

  if (state.projects.length === 0) {
    return (
      <>
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No projects yet</div>
          <div className={styles.emptyText}>
            Create your first project to start organizing and prioritizing ideas.
          </div>
          <button className={styles.emptyBtn} onClick={handleAddProject}>
            + New Project
          </button>
        </div>

        {state.showProjectForm && <ProjectForm />}
      </>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {state.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <button className={styles.addCard} onClick={handleAddProject}>
          <span className={styles.addIcon}>+</span>
          <span className={styles.addLabel}>New Project</span>
        </button>
      </div>

      {state.showProjectForm && <ProjectForm />}

      {projectToDelete && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete.name}"${ideaCountForDelete > 0 ? ` and its ${ideaCountForDelete} idea${ideaCountForDelete === 1 ? "" : "s"}` : ""}? This cannot be undone.`}
          onConfirm={() =>
            dispatch({ type: "DELETE_PROJECT", payload: projectToDelete.id })
          }
          onCancel={() =>
            dispatch({ type: "SET_DELETE_PROJECT_CONFIRM", payload: null })
          }
        />
      )}
    </>
  );
}
