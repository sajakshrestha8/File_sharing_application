import { Cloud, Bell, Search } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon-wrapper">
            <Cloud className="logo-icon" />
          </div>
          <span className="logo-text">CloudNest</span>
        </div>

        <nav className="nav-menu">
          {["My Files", "Shared", "Recent", "Starred"].map((item) => (
            <button key={item} className="nav-button">
              {item}
            </button>
          ))}
        </nav>

        <div className="actions-section">
          <button className="icon-button">
            <Search size={16} />
          </button>
          <button className="icon-button">
            <Bell size={16} />
          </button>
          <div className="avatar">JD</div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
