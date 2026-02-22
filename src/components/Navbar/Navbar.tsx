import { NavLink } from "react-router-dom";
import cn from "classnames";
import styles from "./Navbar.module.scss";

const linksMap = [
  { name: "THE WORLD MAP", path: "/map" },
  { name: "WORLD SETTINGS", path: "/world-settings" },
  { name: "THE EXPORT VAULT", path: "/export" },
  { name: "NEW FOUNDATION", path: "/new" },
  { name: "THE CHRONICLES", path: "/about" },
];

export const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>≡☼ ARMOK'S BLUEPRINT ☼≡</div>
      <div className={styles.links}>
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
      <div className={styles.version}>v0.0.1</div>
    </nav>
  );
};
