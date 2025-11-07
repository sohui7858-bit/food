// src/components/HeaderNav.jsx
import { useNavigate } from "react-router-dom";

export default function HeaderNav() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        padding: "40px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        boxSizing: "border-box",
        zIndex: 100,
      }}
    >
      {/* ✅ 외곽선 홈 아이콘 (SVG) */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        }}
        aria-label="홈으로 이동"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#01579B"         // ✅ 외곽선 색 (skyblue 계열)
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "36px", height: "36px" }}  // ✅ 크기
        >
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      </button>
    </nav>
  );
}
