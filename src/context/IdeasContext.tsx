import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import { type Idea, type Project, type Status, type ViewMode, type SortMode } from "../types";
import { calculateRice } from "../utils/rice";

const STORAGE_KEY = "discovery-ideas";
const PROJECTS_KEY = "discovery-projects";
const PREFS_KEY = "discovery-prefs";

// --- State ---

interface AppState {
  ideas: Idea[];
  projects: Project[];
  activeProjectId: string | null;
  viewMode: ViewMode;
  sortMode: SortMode;
  editingIdea: Idea | null;
  showForm: boolean;
  deleteConfirm: string | null; // idea id
  editingProject: Project | null;
  showProjectForm: boolean;
  deleteProjectConfirm: string | null; // project id
}

const initialState: AppState = {
  ideas: [],
  projects: [],
  activeProjectId: null,
  viewMode: "table",
  sortMode: "auto",
  editingIdea: null,
  showForm: false,
  deleteConfirm: null,
  editingProject: null,
  showProjectForm: false,
  deleteProjectConfirm: null,
};

// --- Actions ---

type Action =
  | { type: "ADD_IDEA"; payload: Omit<Idea, "id" | "projectId" | "riceScore" | "order" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_IDEA"; payload: { id: string } & Partial<Omit<Idea, "id" | "projectId" | "riceScore" | "createdAt">> }
  | { type: "DELETE_IDEA"; payload: string }
  | { type: "REORDER"; payload: { ideas: Idea[] } }
  | { type: "CHANGE_STATUS"; payload: { id: string; status: Status; newOrder?: number } }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_SORT_MODE"; payload: SortMode }
  | { type: "SET_EDITING"; payload: Idea | null }
  | { type: "SET_SHOW_FORM"; payload: boolean }
  | { type: "SET_DELETE_CONFIRM"; payload: string | null }
  | { type: "LOAD_IDEAS"; payload: Idea[] }
  | { type: "ADD_PROJECT"; payload: Omit<Project, "id" | "createdAt"> }
  | { type: "UPDATE_PROJECT"; payload: { id: string } & Partial<Omit<Project, "id" | "createdAt">> }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_ACTIVE_PROJECT"; payload: string | null }
  | { type: "SET_EDITING_PROJECT"; payload: Project | null }
  | { type: "SET_SHOW_PROJECT_FORM"; payload: boolean }
  | { type: "SET_DELETE_PROJECT_CONFIRM"; payload: string | null };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_IDEAS":
      return { ...state, ideas: action.payload };

    case "ADD_IDEA": {
      const now = new Date().toISOString();
      const { reach, impact, confidence, effort } = action.payload;
      const projectId = state.activeProjectId!;
      const maxOrder = state.ideas
        .filter((i) => i.projectId === projectId && i.status === action.payload.status)
        .reduce((max, i) => Math.max(max, i.order), -1);
      const idea: Idea = {
        ...action.payload,
        id: crypto.randomUUID(),
        projectId,
        riceScore: calculateRice(reach, impact, confidence, effort),
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, ideas: [...state.ideas, idea] };
    }

    case "UPDATE_IDEA": {
      const ideas = state.ideas.map((idea) => {
        if (idea.id !== action.payload.id) return idea;
        const updated = { ...idea, ...action.payload, updatedAt: new Date().toISOString() };
        updated.riceScore = calculateRice(
          updated.reach,
          updated.impact,
          updated.confidence,
          updated.effort
        );
        return updated;
      });
      return { ...state, ideas };
    }

    case "DELETE_IDEA":
      return {
        ...state,
        ideas: state.ideas.filter((i) => i.id !== action.payload),
        deleteConfirm: null,
      };

    case "REORDER":
      return { ...state, ideas: action.payload.ideas };

    case "CHANGE_STATUS": {
      const { id, status, newOrder } = action.payload;
      const ideas = state.ideas.map((idea) => {
        if (idea.id !== id) return idea;
        return {
          ...idea,
          status,
          order: newOrder ?? idea.order,
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...state, ideas };
    }

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SET_SORT_MODE":
      return { ...state, sortMode: action.payload };

    case "SET_EDITING":
      return { ...state, editingIdea: action.payload, showForm: action.payload !== null };

    case "SET_SHOW_FORM":
      return {
        ...state,
        showForm: action.payload,
        editingIdea: action.payload ? state.editingIdea : null,
      };

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirm: action.payload };

    // --- Project actions ---

    case "ADD_PROJECT": {
      const project: Project = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, projects: [...state.projects, project] };
    }

    case "UPDATE_PROJECT": {
      const projects = state.projects.map((p) => {
        if (p.id !== action.payload.id) return p;
        return { ...p, ...action.payload };
      });
      return { ...state, projects };
    }

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        ideas: state.ideas.filter((i) => i.projectId !== action.payload),
        deleteProjectConfirm: null,
        activeProjectId:
          state.activeProjectId === action.payload ? null : state.activeProjectId,
      };

    case "SET_ACTIVE_PROJECT":
      return { ...state, activeProjectId: action.payload };

    case "SET_EDITING_PROJECT":
      return {
        ...state,
        editingProject: action.payload,
        showProjectForm: action.payload !== null,
      };

    case "SET_SHOW_PROJECT_FORM":
      return {
        ...state,
        showProjectForm: action.payload,
        editingProject: action.payload ? state.editingProject : null,
      };

    case "SET_DELETE_PROJECT_CONFIRM":
      return { ...state, deleteProjectConfirm: action.payload };

    default:
      return state;
  }
}

// --- Context ---

interface IdeasContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const IdeasContext = createContext<IdeasContextType | null>(null);

export function IdeasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const storedIdeas = localStorage.getItem(STORAGE_KEY);
      const storedProjects = localStorage.getItem(PROJECTS_KEY);
      const prefs = localStorage.getItem(PREFS_KEY);

      let ideas: Idea[] = storedIdeas ? JSON.parse(storedIdeas) : [];
      let projects: Project[] = storedProjects ? JSON.parse(storedProjects) : [];
      const { viewMode, sortMode, activeProjectId } = prefs
        ? JSON.parse(prefs)
        : { viewMode: "table", sortMode: "auto", activeProjectId: null };

      // Migration: assign orphaned ideas to an auto-created "My Ideas" project
      const orphans = ideas.filter((i) => !i.projectId);
      if (orphans.length > 0) {
        let defaultProject = projects.find((p) => p.name === "My Ideas");
        if (!defaultProject) {
          defaultProject = {
            id: crypto.randomUUID(),
            name: "My Ideas",
            description: "Migrated ideas",
            createdAt: new Date().toISOString(),
          };
          projects = [...projects, defaultProject];
        }
        ideas = ideas.map((i) =>
          i.projectId ? i : { ...i, projectId: defaultProject!.id }
        );
      }

      return { ...init, ideas, projects, viewMode, sortMode, activeProjectId };
    } catch {
      return init;
    }
  });

  // Persist ideas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.ideas));
  }, [state.ideas]);

  // Persist projects
  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(state.projects));
  }, [state.projects]);

  // Persist prefs (including activeProjectId)
  useEffect(() => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        viewMode: state.viewMode,
        sortMode: state.sortMode,
        activeProjectId: state.activeProjectId,
      })
    );
  }, [state.viewMode, state.sortMode, state.activeProjectId]);

  return (
    <IdeasContext.Provider value={{ state, dispatch }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider");
  return ctx;
}
