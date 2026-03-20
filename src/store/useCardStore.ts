import { create } from 'zustand';

// 1. 데이터 타입 정의 (TypeScript 스키마)
export interface StyleConfig {
  primaryColor: string;
  bgColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface EventInfo {
  date: string;
  time: string;
  venueName: string;
  venueDetail: string;
}

export interface Profile {
  name: string;
  phone: string;
  relation: string;
}

export interface CardData {
  style: StyleConfig;
  eventInfo: EventInfo;
  greeting: { title: string; content: string };
  hosts: { groom: Profile; bride: Profile };
  location: { address: string; mapProvider: 'kakao' | 'naver'; transitInfo: string };
  accounts: Array<{ bank: string; accountNo: string; holder: string }>;
}

// 2. 상태 관리 스토어 및 업데이트 로직
interface CardStore {
  data: CardData;
  updateStyle: (style: Partial<StyleConfig>) => void;
  updateEventInfo: (info: Partial<EventInfo>) => void;
  updateGreeting: (greeting: Partial<{ title: string; content: string }>) => void;
  // 확장성을 고려해 특정 섹션만 핀포인트로 업데이트하는 함수들입니다.
}

export const useCardStore = create<CardStore>((set) => ({
  // 초기 데이터 (미리보기 화면이 처음에 비어있지 않도록 더미 데이터 삽입)
  data: {
    style: {
      primaryColor: '#ff7b72',
      bgColor: '#ffffff',
      fontFamily: 'Pretendard',
      borderRadius: '8px',
    },
    eventInfo: {
      date: '2026-10-29',
      time: '오후 2:00',
      venueName: '더 신라 서울',
      venueDetail: '다이너스티 홀 3F',
    },
    greeting: {
      title: '초대합니다',
      content: '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어가고자 합니다.',
    },
    hosts: {
      groom: { name: '김민준', phone: '010-0000-0000', relation: '장남' },
      bride: { name: '박서연', phone: '010-1111-1111', relation: '장녀' },
    },
    location: {
      address: '서울 중구 동호로 249',
      mapProvider: 'kakao',
      transitInfo: '지하철 3호선 동대입구역 5번 출구',
    },
    accounts: [],
  },

  // 상태 업데이트 액션 (좌측 에디터에서 호출할 함수들)
  updateStyle: (newStyle) =>
    set((state) => ({ data: { ...state.data, style: { ...state.data.style, ...newStyle } } })),
    
  updateEventInfo: (newInfo) =>
    set((state) => ({ data: { ...state.data, eventInfo: { ...state.data.eventInfo, ...newInfo } } })),
    
  updateGreeting: (newGreeting) =>
    set((state) => ({ data: { ...state.data, greeting: { ...state.data.greeting, ...newGreeting } } })),
}));