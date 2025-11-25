export interface Artwork {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: string;
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
    title: "현대 미술의 흐름",
    subtitle: "2024.01.15 - 2024.03.31",
    location: "국립현대미술관",
    description: "20세기부터 현재까지의 현대 미술 작품들을 한눈에",
    artworks: [
      {
        id: "1-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "https://example.com/audio/1-1.mp3",
        duration: "3:24",
      },
      {
        id: "1-2",
        title: "작품 2",
        artist: "작가명",
        audioUrl: "https://example.com/audio/1-2.mp3",
        duration: "4:12",
      },
      {
        id: "1-3",
        title: "작품 3",
        artist: "작가명",
        audioUrl: "https://example.com/audio/1-3.mp3",
        duration: "2:45",
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
      },
      {
        id: "2-2",
        title: "작품 2",
        artist: "작가명",
        audioUrl: "https://example.com/audio/2-2.mp3",
        duration: "4:12",
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
