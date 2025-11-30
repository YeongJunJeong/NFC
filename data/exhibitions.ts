export interface Artwork {
  id: string;
  title: string;
  artist: string;
  audioUrl: string | any; // 오디오 파일 URL 또는 require()로 로드한 로컬 파일
  duration: string;
  imageUrl?: any; // 앨범 아트워크 이미지 (선택적, require() 또는 { uri: string })
  displayMode?: "standard" | "fullscreen"; // 표시 모드 (기본값: standard)
  backgroundColor?: string; // fullscreen 모드에서 이미지 없을 때 사용할 배경색
}

export interface Exhibition {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  artworks: Artwork[];
}

export const exhibitions: Exhibition[] = [
  {
    id: "1",
    title: "인상주의에서 초기 모더니즘까지, 빛을 수집한 사람들",
    subtitle: "2024.01.15 - 2024.03.31",
    location: "국립중앙박물관",
    description: "20세기부터 현재까지의 현대 미술 작품들을 한눈에",
    artworks: [
      {
        id: "1-1",
        title: "겨울 아침의 몽마르트르 대로",
        artist: "카미유 피사로",
        audioUrl: require("./audio/겨울 아침의 몽마르트르 대로_카미유 피사로.wav"),
        duration: "3:24",
        imageUrl: require("./image/겨울 아침의 몽마르트르 대로_카미유 피사로.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#2c3e50",
      },
      {
        id: "1-2",
        title: "그랑드자트섬의 일요일 오후를 의한 습작",
        artist: "조르주 쇠라",
        audioUrl: "https://example.com/audio/1-2.mp3",
        duration: "4:12",
        imageUrl: require("./image/그랑드자트섬의 일요일 오후를 의한 습작_조르주 쇠라.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#1a5490",
      },
      {
        id: "1-3",
        title: "꽃피는 과수원",
        artist: "빈센트 빈 고흐",
        audioUrl: "https://example.com/audio/1-3.mp3",
        duration: "2:45",
        imageUrl: require("./image/꽃피는 과수원_빈센트 빈 고흐.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#8b3a62",
      },
      {
        id: "1-4",
        title: "목욕하는 타히티 여인들",
        artist: "폴 고갱",
        audioUrl: "https://example.com/audio/1-4.mp3",
        duration: "3:15",
        imageUrl: require("./image/목욕하는 타히티 여인들_폴 고갱.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#6b4423",
      },
      {
        id: "1-5",
        title: "밤나무길",
        artist: "알프레드 시슬레",
        audioUrl: "https://example.com/audio/1-5.mp3",
        duration: "3:30",
        imageUrl: require("./image/밤나무길_알프레드 시슬레.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#2d5016",
      },
      {
        id: "1-6",
        title: "연못",
        artist: "테오도르 루소",
        audioUrl: "https://example.com/audio/1-6.mp3",
        duration: "3:20",
        imageUrl: require("./image/연못_테오도르 루소.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#3a5f3a",
      },
      {
        id: "1-7",
        title: "자 드 부팡 근처의 나무와 집들",
        artist: "폴 세잔",
        audioUrl: "https://example.com/audio/1-7.mp3",
        duration: "4:00",
        imageUrl: require("./image/자 드 부팡 근처의 나무와 집들_폴 세잔.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#8b4513",
      },
      {
        id: "1-8",
        title: "클리시 광장",
        artist: "폴 시냐크",
        audioUrl: "https://example.com/audio/1-8.mp3",
        duration: "3:45",
        imageUrl: require("./image/클리시 광장_폴 시냐크.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#4a6fa5",
      },
      {
        id: "1-9",
        title: "피아노를 치는 두 소녀",
        artist: "오귀스트 르누아르",
        audioUrl: "https://example.com/audio/1-9.mp3",
        duration: "3:50",
        imageUrl: require("./image/피아노를 치는 두 소녀_오귀스트 르누아르.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#4a2c2a",
      },
      {
        id: "1-10",
        title: "해변의 사람들",
        artist: "오귀스트 르누아르",
        audioUrl: "https://example.com/audio/1-10.mp3",
        duration: "3:10",
        imageUrl: require("./image/해변의 사람들_오귀스트 르누아르.jpg"),
        displayMode: "fullscreen",
        backgroundColor: "#5a8a6b",
      },
      {
        id: "1-11",
        title: "햇빛이 비치는 수면",
        artist: "모리스 드 블라맹크",
        audioUrl: "https://example.com/audio/1-11.mp3",
        duration: "3:35",
        imageUrl: require("./image/햇빛이 비치는 수면_모리스 드 블라맹크.png"),
        displayMode: "fullscreen",
        backgroundColor: "#2c4a6b",
      },
    ],
  },
  {
    id: "2",
    title: "인상주의의 빛",
    subtitle: "2024.02.01 - 2024.04.30",
    location: "서울시립미술관",
    description: "모네, 르누아르 등 인상주의 거장들의 작품 전시",
    artworks: [
      {
        id: "2-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "https://example.com/audio/2-1.mp3",
        duration: "3:24",
        displayMode: "fullscreen",
        backgroundColor: "#2d5016", // 녹색 그라데이션
      },
      {
        id: "2-2",
        title: "작품 2",
        artist: "작가명",
        audioUrl: "https://example.com/audio/2-2.mp3",
        duration: "4:12",
        displayMode: "fullscreen",
        backgroundColor: "#2d5016",
      },
    ],
  },
  {
    id: "3",
    title: "한국 현대 조각",
    subtitle: "2024.02.10 - 2024.05.15",
    location: "예술의전당",
    description: "한국 현대 조각가들의 작품을 만나보세요",
    artworks: [
      {
        id: "3-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "https://example.com/audio/3-1.mp3",
        duration: "3:24",
        displayMode: "fullscreen",
        backgroundColor: "#8b4513", // 브라운 그라데이션
      },
    ],
  },
];

const exhibitionMap = new Map(exhibitions.map((item) => [item.id, item]));

export function getExhibitionById(id?: string) {
  if (!id) return undefined;
  return exhibitionMap.get(id);
}

export function getArtworkById(exhibitionId?: string, artworkId?: string) {
  const exhibition = getExhibitionById(exhibitionId);
  if (!exhibition || !artworkId) {
    return { exhibition, artwork: undefined };
  }

  const artwork = exhibition.artworks.find((item) => item.id === artworkId);
  return { exhibition, artwork };
}
