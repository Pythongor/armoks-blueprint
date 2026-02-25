import { useSelector, useDispatch } from "react-redux";
import { Modal, setModal } from "@store/uiSlice";
import { type RootState } from "@store/index";
import { ResetDestructiveModal } from "./ResetDestructiveModal";
import styles from "./Modal.module.scss";

export const ModalManager = () => {
  const dispatch = useDispatch();
  const activeModal = useSelector((state: RootState) => state.ui.modal);

  if (activeModal === Modal.None) return null;

  const closeModal = () => dispatch(setModal(Modal.None));

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {activeModal === Modal.ResetDestructiveOptions && (
          <ResetDestructiveModal onClose={closeModal} />
        )}
      </div>
    </div>
  );
};
