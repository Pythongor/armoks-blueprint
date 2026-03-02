import type { RootState } from "@store/index";
import styles from "./ApplyButton.module.scss";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useWorldInitializer } from "@hooks/useWorldInitializer";

export function ApplyButton() {
  const { availableBlueprints, selectedTitles } = useSelector(
    (state: RootState) => state.gallery,
  );
  const navigate = useNavigate();
  const handleStart = useWorldInitializer();

  const handleApply = () => {
    const finalSelection = availableBlueprints.filter((b) =>
      selectedTitles.includes(b.title),
    );
    handleStart(finalSelection);
    navigate("/world-settings");
  };
  return (
    <button className={styles.base} onClick={handleApply}>
      RESTORE SELECTED ARCHIVES ({selectedTitles.length})
    </button>
  );
}
