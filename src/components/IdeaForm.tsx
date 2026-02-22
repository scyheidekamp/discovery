import { useState, useEffect, useRef } from "react";
import { useIdeas } from "../context/IdeasContext";
import { calculateRice } from "../utils/rice";
import { getScoreColor } from "../utils/rice";
import { IMPACT_OPTIONS, STATUS_LIST, STATUS_CONFIG } from "../types";
import type { Status } from "../types";
import styles from "../styles/IdeaForm.module.css";

export default function IdeaForm() {
  const { state, dispatch } = useIdeas();
  const editing = state.editingIdea;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reach, setReach] = useState(5);
  const [impact, setImpact] = useState(1);
  const [confidence, setConfidence] = useState(80);
  const [effort, setEffort] = useState(4);
  const [status, setStatus] = useState<Status>("open");

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description);
      setReach(editing.reach);
      setImpact(editing.impact);
      setConfidence(editing.confidence);
      setEffort(editing.effort);
      setStatus(editing.status);
    }
  }, [editing]);

  useEffect(() => {
    titleRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const riceScore = calculateRice(reach, impact, confidence, effort);
  const scoreColor = getScoreColor(riceScore);

  function close() {
    dispatch({ type: "SET_SHOW_FORM", payload: false });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editing) {
      dispatch({
        type: "UPDATE_IDEA",
        payload: { id: editing.id, title: title.trim(), description: description.trim(), reach, impact, confidence, effort, status },
      });
    } else {
      dispatch({
        type: "ADD_IDEA",
        payload: { title: title.trim(), description: description.trim(), reach, impact, confidence, effort, status },
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
            {editing ? "Edit Idea" : "New Idea"}
          </span>
          <button type="button" className={styles.closeBtn} onClick={close}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              ref={titleRef}
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the idea?"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe it briefly..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.scorePreview}>
            <span className={styles.scoreLabel}>RICE Score</span>
            <span className={styles.scoreValue} style={{ color: scoreColor }}>
              {riceScore}
            </span>
          </div>

          <div className={styles.riceGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Really, who needs this? (1-10)</label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  className={styles.slider}
                  min={1}
                  max={10}
                  step={1}
                  value={reach}
                  onChange={(e) => setReach(Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{reach}</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Impact on WOW factor</label>
              <select
                className={styles.select}
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
              >
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confidence (0-100%)</label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  className={styles.slider}
                  min={0}
                  max={100}
                  step={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{confidence}%</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Effort (hours)</label>
              <input
                type="number"
                className={styles.input}
                min={1}
                max={9999}
                step={1}
                value={effort}
                onChange={(e) => setEffort(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={close}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={!title.trim()}>
            {editing ? "Save Changes" : "Create Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
