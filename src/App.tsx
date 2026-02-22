import { IdeasProvider, useIdeas } from "./context/IdeasContext";
import Header from "./components/Header";
import ProjectsPage from "./components/ProjectsPage";
import TableView from "./components/TableView";
import KanbanBoard from "./components/KanbanBoard";
import IdeaForm from "./components/IdeaForm";
import ConfirmDialog from "./components/ConfirmDialog";
import styles from "./styles/App.module.css";

function AppContent() {
  const { state, dispatch } = useIdeas();

  const ideaToDelete = state.deleteConfirm
    ? state.ideas.find((i) => i.id === state.deleteConfirm)
    : null;

  return (
    <div className={styles.app}>
      <Header />

      {state.activeProjectId ? (
        <>
          <div className={styles.content}>
            {state.viewMode === "table" ? <TableView /> : <KanbanBoard />}
          </div>

          {state.showForm && <IdeaForm />}

          {ideaToDelete && (
            <ConfirmDialog
              title="Delete Idea"
              message={`Are you sure you want to delete "${ideaToDelete.title}"? This cannot be undone.`}
              onConfirm={() =>
                dispatch({ type: "DELETE_IDEA", payload: ideaToDelete.id })
              }
              onCancel={() =>
                dispatch({ type: "SET_DELETE_CONFIRM", payload: null })
              }
            />
          )}
        </>
      ) : (
        <ProjectsPage />
      )}
    </div>
  );
}

export default function App() {
  return (
    <IdeasProvider>
      <AppContent />
    </IdeasProvider>
  );
}
