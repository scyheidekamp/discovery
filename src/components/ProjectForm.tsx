import { useState, useEffect, useRef } from "react";
import { useIdeas } from "../context/IdeasContext";
import styles from "../styles/IdeaForm.module.css";

export default function ProjectForm() {
  const { state, dispatch } = useIdeas();
  const editing = state.editingProject;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description);
    }
  }, [editing]);

  useEffect(() => {
    nameRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function close() {
    dispatch({ type: "SET_SHOW_PROJECT_FORM", payload: false });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editing) {
      dispatch({
        type: "UPDATE_PROJECT",
        payload: { id: editing.id, name: name.trim(), description: description.trim() },
      });
    } else {
      dispatch({
        type: "ADD_PROJECT",
        payload: { name: name.trim(), description: description.trim() },
      });
    }
    close();
  }

  return (
    <div className={styles.overlay} onClick={close}>
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            {editing ? "Edit Project" : "New Project"}
          </span>
          <button type="button" className={styles.closeBtn} onClick={close}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              ref={nameRef}
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={close}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={!name.trim()}>
            {editing ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
