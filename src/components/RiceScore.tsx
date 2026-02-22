import { getScoreLevel } from "../utils/rice";
import styles from "../styles/RiceScore.module.css";

interface Props {
  score: number;
}

export default function RiceScore({ score }: Props) {
  const level = getScoreLevel(score);
  return (
    <span className={`${styles.badge} ${styles[level]}`}>
      {score}
    </span>
  );
}
