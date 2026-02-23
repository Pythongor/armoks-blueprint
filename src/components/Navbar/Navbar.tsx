import { NavLink, useNavigate } from "react-router-dom";

import cn from "classnames";
import { resetWorld } from "@store/worldSlice";
import styles from "./Navbar.module.scss";
import { useDispatch } from "react-redux";

const linksMap = [
  { name: "THE WORLD MAP", path: "/map" },
  { name: "WORLD SETTINGS", path: "/world-settings" },
  { name: "THE EXPORT VAULT", path: "/export" },
  { name: "THE CHRONICLES", path: "/about" },
];

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNewFoundation = () => {
    const confirmed = window.confirm(
      "Abandon this fortress? All unsaved strata will be lost to the void.",
    );

    if (confirmed) {
      dispatch(resetWorld());
      navigate("/");
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>≡☼ ARMOK'S BLUEPRINT ☼≡</div>

      <div className={styles.links}>
        <button className={styles.actionButton} onClick={handleNewFoundation}>
          NEW FOUNDATION
        </button>
        {linksMap.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(isActive && styles.active)}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
