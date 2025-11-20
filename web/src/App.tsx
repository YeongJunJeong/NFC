import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Exhibition = {
  id: string;
  title: string;
  venue: string;
  period: string;
  status: "live" | "upcoming";
  tags: string[];
  tracks: number;
  description: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function useExhibitions() {
  const [data, setData] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/exhibitions`)
      .then(async (res) => {
        if (!res.ok) throw new Error("전시 정보를 가져오지 못했습니다.");
        return res.json();
      })
      .then((payload: Exhibition[]) => {
        if (mounted) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

function App() {
  const { data, loading, error } = useExhibitions();
  const liveExhibition = data.find((item) => item.status === "live");
  const secondaryExhibitions = data.filter(
    (item) => item.id !== liveExhibition?.id
  );

  const heroMetrics = useMemo(() => {
    const totalTracks = data.reduce((sum, item) => sum + item.tracks, 0);
    return {
      exhibitions: data.length,
      tracks: totalTracks,
      listeners: "27K",
    };
  }, [data]);

  return (
    <div className="page">
      <main className="app-shell">
        <Hero metrics={heroMetrics} />

        <section className="flow">
          <div className="flow-intro">
            <p>오늘, 오디가 수집한 공간의 숨을 그대로 흘려보냅니다.</p>
            <span>{heroMetrics.exhibitions}개의 전시가 동시 재생 중</span>
          </div>
          <EditorialStrip metrics={heroMetrics} />

          {loading && <p className="hint">전시 정보를 불러오는 중...</p>}
          {error && <p className="hint error">{error}</p>}
          {!loading && !error && (
            <div className="flow-grid">
              <div className="exhibition-stack">
                {liveExhibition && (
                  <ExhibitionCard exhibition={liveExhibition} highlight />
                )}
                {secondaryExhibitions.map((item) => (
                  <ExhibitionCard key={item.id} exhibition={item} />
                ))}
              </div>

              <PlaylistPanel exhibition={liveExhibition} />
            </div>
          )}
        </section>
      </main>

      <BottomNav exhibition={liveExhibition} />
    </div>
  );
}

function Hero({
  metrics,
}: {
  metrics: { exhibitions: number; tracks: number; listeners: string };
}) {
  return (
    <header className="hero">
      <div className="monogram">
        <span>odii</span>
        <small>immersive audio journal</small>
      </div>
      <h1>
        지금, <em>공간의 숨</em>을 <br />
        오디로 듣다
      </h1>
      <p className="subcopy">
        전시장 QR을 스캔하거나 활성화된 전시를 선택하면 큐레이터가 직접
        녹음한 스토리와 사운드 스케이프가 열립니다.
      </p>
      <div className="hero-actions">
        <button className="primary">QR 인식</button>
        <button className="secondary">
          현재 위치 동기화 <span>↗</span>
        </button>
      </div>
      <div className="hero-meta">
        <article>
          <span>ACTIVE</span>
          <strong>{metrics.exhibitions} 전시</strong>
        </article>
        <article>
          <span>가이드</span>
          <strong>{metrics.tracks} 트랙</strong>
        </article>
        <article>
          <span>커뮤니티</span>
          <strong>{metrics.listeners} 청취</strong>
        </article>
      </div>
    </header>
  );
}

function ExhibitionCard({
  exhibition,
  highlight,
}: {
  exhibition: Exhibition;
  highlight?: boolean;
}) {
  return (
    <article className={`exhibition-card ${highlight ? "highlight" : ""}`}>
      {highlight && <div className="badge-live">NOW PLAYING</div>}
      <h3>{exhibition.title}</h3>
      <p>
        {exhibition.venue} · {exhibition.period}
        <br />
        {exhibition.description}
      </p>
      <div className="tags">
        {exhibition.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <span className="play-pill">가이드를 듣기</span>
        <span className="tag">{exhibition.tracks} tracks</span>
      </div>
    </article>
  );
}

function PlaylistPanel({ exhibition }: { exhibition?: Exhibition }) {
  const playlist = useMemo(() => {
    if (!exhibition) return [];

    return new Array(3).fill(null).map((_, index) => ({
      title: `${String(index + 1).padStart(2, "0")}. ${exhibition.title} 트랙`,
      curator: "큐레이터 신유진",
      flavor: index === 0 ? "3D 사운드" : index === 1 ? "인터뷰" : "Foley",
      duration: index === 0 ? "07:42" : index === 1 ? "05:13" : "04:26",
    }));
  }, [exhibition]);

  return (
    <div className="playlist-panel">
      <p className="panel-topline">지금 흘러나오는 트랙</p>
      {playlist.length === 0 ? (
        <p className="hint">활성화된 전시를 선택하면 플레이리스트가 나타납니다.</p>
      ) : (
        playlist.map((track) => (
          <article className="playlist-item" key={track.title}>
            <div className="play-pill ghost">▶</div>
            <div className="track-info">
              <strong>{track.title}</strong>
              <span>
                {track.curator} · {track.flavor}
              </span>
            </div>
            <div className="track-time">{track.duration}</div>
          </article>
        ))
      )}
    </div>
  );
}

function BottomNav({ exhibition }: { exhibition?: Exhibition }) {
  // Mini-player UI is temporarily disabled.
  return null;
}

export default App;

function EditorialStrip({
  metrics,
}: {
  metrics: { exhibitions: number; tracks: number; listeners: string };
}) {
  const strips = [
    `ACTIVE ${metrics.exhibitions} EXHIBITIONS`,
    `${metrics.tracks} TRACKS IN THE AIR`,
    `${metrics.listeners} LISTENERS NOW`,
  ];

  return (
    <div className="editorial-strip">
      {strips.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}
