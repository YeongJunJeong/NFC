import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const exhibitions = [
  {
    id: "light-epic",
    title: "빛의 서사",
    venue: "MMCA 서울",
    period: "2024.11 — 2025.02",
    tags: ["Immersive", "Soundscape"],
    tracks: 24,
    status: "live",
    description: "빛과 어둠이 교차하는 다감각 설치전",
  },
  {
    id: "city-breath",
    title: "도시의 숨",
    venue: "롯데뮤지엄",
    period: "2024.12 — 2025.03",
    tags: ["Ambient", "Field"],
    tracks: 18,
    status: "upcoming",
    description: "아티스트들의 초고해상도 도시 앰비언트",
  },
  {
    id: "sound-pavilion",
    title: "사운드 파빌리온",
    venue: "리움MI",
    period: "2025.01 — 2025.05",
    tags: ["Architectural", "Live"],
    tracks: 32,
    status: "upcoming",
    description: "공간이 악기가 되는 사운드 아키텍처",
  },
];

app.get("/api/status", (_req, res) => {
  res.json({ service: "odii", version: "0.1.0", status: "ok" });
});

app.get("/api/exhibitions", (_req, res) => {
  res.json(exhibitions);
});

app.listen(PORT, () => {
  console.log(`Odii backend running on http://localhost:${PORT}`);
});

