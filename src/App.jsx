// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage.jsx";
import InventoryInput from "./pages/InventoryInput.jsx";
import AIOrderRecommend from "./pages/AIOrderRecommend.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import OrderPage from "./pages/OrderPage.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* 전체 화면 중앙정렬 */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EAF6FB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            transform: "scale(0.90)",
            transformOrigin: "center center", // 중앙 기준으로 줄이기
          }}
        >
          {/* 아이폰 비율 화면 */}
          <div
            style={{
              width: "430px",
              height: "932px",               // 실제 아이폰 14 세로 해상도
              backgroundColor: "#FFFFFF",
              borderRadius: "40px",
              boxShadow: "0 0 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 24px",
            }}
          >
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/inventory" element={<InventoryInput />} />
              <Route path="/ai-order" element={<AIOrderRecommend />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/order" element={<OrderPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
