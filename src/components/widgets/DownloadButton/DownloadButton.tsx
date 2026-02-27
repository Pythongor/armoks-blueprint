import cn from "classnames";
import styles from "./DownloadButton.module.scss";

type ProgressButtonProps = {
  progress: number;
  isError?: boolean;
  onClick: () => void;
  labels: {
    idle: string;
    loading?: string;
    success?: string;
    error?: string;
  };
  disabled?: boolean;
  className?: string;
};

export function DownloadButton({
  progress,
  isError,
  onClick,
  labels: {
    idle: idleLabel,
    loading: loadingLabel = "ENGRAVING...",
    success: successLabel = "SUCCESS!",
    error: errorLabel = "FORGE FAILED - TRY AGAIN",
  },
  disabled,
  className,
}: ProgressButtonProps) {
  const isLoading = progress > 0 && progress < 100;
  const isComplete = progress === 100 && !isError;

  return (
    <button
      className={cn(
        styles.base,
        isLoading && styles.loading,
        isComplete && styles.success,
        isError && styles.error,
        className,
      )}
      onClick={onClick}
      disabled={disabled || (isLoading && !isError)}
    >
      {isLoading && !isError && (
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      )}

      <span className={styles.btnText}>
        {isError && errorLabel}
        {!isError && progress === 0 && idleLabel}
        {!isError && isLoading && `${loadingLabel} ${progress}%`}
        {!isError && progress === 100 && successLabel}
      </span>
    </button>
  );
}
