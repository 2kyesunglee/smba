import { Worker } from '@/domain/entities/Worker';
import { Inspection } from '@/domain/entities/Inspection';
import { PTWRequest } from '@/domain/entities/PTWRequest';
import { SOSAlert } from '@/domain/entities/SOSAlert';
import { EquipmentQR } from '@/domain/entities/EquipmentQR';
import { Template } from '@/domain/entities/Template';
import { Signature } from '@/domain/entities/Signature';
import { WorkReport } from '@/domain/entities/WorkReport';

export interface DocumentItem {
  id: string;
  title: string;
  category: 'VISA' | 'HEALTH' | 'COMPLIANCE' | 'MANUAL';
  fileName: string;
  fileSize: string;
  downloadCount: number;
  uploadedAt: string;
}

export interface AppNotification {
  id: string;
  type: 'SOS' | 'PTW' | 'INSPECTION' | 'VISA' | 'TASK';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
}

export interface StoreState {
  workers: Worker[];
  equipmentList: EquipmentQR[];
  templates: Template[];
  ptwList: PTWRequest[];
  sosList: SOSAlert[];
  inspections: Inspection[];
  workReports: WorkReport[];
  signatures: Signature[];
  documents: DocumentItem[];
  notifications: AppNotification[];
  currentRole: 'admin' | 'worker';
  activeWorkerId: string;
  currentLanguage: string;
}

const INITIAL_WORKERS: Worker[] = [
  Worker.create({
    id: 'w-1',
    name: 'Nguyen Van An',
    koreanName: '응우옌 안',
    alienRegNumber: '940315-5128764',
    phoneNumber: '010-3456-7890',
    nationality: 'VN',
    visaType: 'E-9',
    gender: 'M',
    status: 'ACTIVE',
    contractStartDate: '2023-11-01',
    contractEndDate: '2026-11-20', // 약 36일 남음 (D-36)
    departureDate: '2026-11-30',
    reEntryAllowed: true,
    specialHealthCheckDate: '2026-10-30', // 15일 남음
  }),
  Worker.create({
    id: 'w-2',
    name: 'Batbayar Bold',
    koreanName: '바트볼드',
    alienRegNumber: '920820-5982134',
    phoneNumber: '010-7788-9900',
    nationality: 'MN',
    visaType: 'E-9',
    gender: 'M',
    status: 'ACTIVE',
    contractStartDate: '2024-02-01',
    contractEndDate: '2026-12-05', // 약 51일 남음 (D-51)
    departureDate: '2026-12-20',
    reEntryAllowed: false,
    specialHealthCheckDate: '2026-11-15',
  }),
  Worker.create({
    id: 'w-3',
    name: 'Juan Dela Cruz',
    koreanName: '후안 크루즈',
    alienRegNumber: '960512-5871239',
    phoneNumber: '010-4455-6677',
    nationality: 'PH',
    visaType: 'E-9',
    gender: 'M',
    status: 'PENDING_APPROVAL', // 앱 승인 대기
    contractStartDate: '2024-09-01',
    contractEndDate: '2027-08-31',
  }),
  Worker.create({
    id: 'w-4',
    name: 'Somchai Prasert',
    koreanName: '솜차이',
    alienRegNumber: '910708-5432198',
    phoneNumber: '010-2233-4455',
    nationality: 'TH',
    visaType: 'E-7',
    gender: 'M',
    status: 'ACTIVE',
    contractStartDate: '2023-05-10',
    contractEndDate: '2027-05-09',
    specialHealthCheckDate: '2026-12-01',
  }),
  Worker.create({
    id: 'w-5',
    name: 'Budi Santoso',
    koreanName: '부디 산토소',
    alienRegNumber: '931114-5321876',
    phoneNumber: '010-9988-1122',
    nationality: 'ID',
    visaType: 'E-9',
    gender: 'M',
    status: 'ACTIVE',
    contractStartDate: '2024-01-15',
    contractEndDate: '2027-01-14',
    specialHealthCheckDate: '2026-10-25',
  }),
  Worker.create({
    id: 'w-6',
    name: 'Rustam Karimov',
    koreanName: '루스탐',
    alienRegNumber: '900223-5612345',
    phoneNumber: '010-5566-7788',
    nationality: 'UZ',
    visaType: 'E-9',
    gender: 'M',
    status: 'PENDING_APPROVAL', // 앱 승인 대기
    contractStartDate: '2024-08-10',
    contractEndDate: '2027-08-09',
  }),
];

const INITIAL_EQUIPMENT: EquipmentQR[] = [
  {
    id: 'eq-1',
    code: 'QR-LOTO-CK01',
    name: 'A동 렌더링 쿠커 #1',
    category: 'EQUIPMENT',
    type: 'LOTO',
    location: 'A동 가공구역 1층',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    cautionNotes: '고온·고압 증기 위험, 메인 밸브 및 전원 차단기 잠금 태그 확인 필수',
    emergencyProcedures: '1단계: 제어반 전원 OFF 및 잠금장치 시건 -> 2단계: 증기 공급 밸브 2중 폐쇄 -> 3단계: 잔류 증기 압력 게이지 0 확인',
    isLotoLocked: true,
    activeWorkerName: 'Nguyen Van An',
    createdAt: '2026-10-01',
  },
  {
    id: 'eq-2',
    code: 'QR-MSDS-CH02',
    name: '보일러 청관제 (알칼리계 B-402)',
    category: 'CHEMICAL',
    type: 'MSDS',
    location: 'B동 보일러실 약품저장탱크',
    imageUrl: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=600&q=80',
    cautionNotes: '강염기성 유해화학물질, 흡입 및 피부 접촉 시 심각한 화상 위험, 내화학 장갑/보안경 필수',
    emergencyProcedures: '피부 접촉 시 흐르는 물에 15분 이상 세척, 눈 유입 시 즉시 세안기 사용 후 병원 이송, 흡입 시 신선한 공기 구역으로 이동',
    isLotoLocked: false,
    createdAt: '2026-10-01',
  },
  {
    id: 'eq-3',
    code: 'QR-CHK-PR03',
    name: '폐수처리장 슬러지 탈수 압착기',
    category: 'EQUIPMENT',
    type: 'SAFETY_RULES',
    location: 'C동 환경정화동',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    cautionNotes: '롤러 협착 위험, 가동 중 투입구 신체 접근 금지, 비상정지 스위치 위치 숙지',
    emergencyProcedures: '비상정지 와이어 풀코드 작동 -> 메인 전원 차단 -> 즉시 관리자 연락',
    isLotoLocked: false,
    createdAt: '2026-10-05',
  },
];

const INITIAL_TEMPLATES: Template[] = [
  new Template({
    id: 'tpl-1',
    title: '고소 및 배관 용접 작업 안전수칙',
    type: 'SAFETY_RULES',
    description: '추락 방지 및 화재 예방을 위한 작업 전 안전수칙 서명 템플릿',
    content: {
      instructions: [
        '안전모 턱끈을 견고히 조이고 안전그네형 안전대를 착용했습니까?',
        '작업 반경 5m 이내 가연물 제거 및 분말 소화기 2기를 배치했습니까?',
        '용접기 자동전격방지기 작동 상태를 점검했습니까?',
      ],
      multilingualNotes: {
        vi: 'Đã kiểm tra dây an toàn, bình chữa cháy và máy hàn an toàn.',
        mn: 'Аюулгүй бүс, гал унтраагч, гагнуурын аппаратын шалгалтыг хийсэн үү.',
      },
    },
  }),
  new Template({
    id: 'tpl-2',
    title: '렌더링 쿠커 일일 안전점검 체크리스트',
    type: 'CHECKLIST',
    description: '온도, 압력 및 밸브 누설 상태 일일 정기 점검표',
    content: {
      fields: [
        {
          id: 'temperature',
          label: '내부 가열 온도 (°C)',
          type: 'number',
          unit: '°C',
          minThreshold: 80,
          maxThreshold: 130, // 130 초과 시 이상
          required: true,
        },
        {
          id: 'pressure',
          label: '증기 공급 압력 (bar)',
          type: 'number',
          unit: 'bar',
          minThreshold: 1.0,
          maxThreshold: 3.5,
          required: true,
        },
        {
          id: 'steam_leak',
          label: '배관 증기 누설 유무',
          type: 'select',
          options: ['정상(누설 없음)', '미세 누설', '심각한 누설'],
          required: true,
        },
      ],
    },
  }),
];

const INITIAL_PTW: PTWRequest[] = [
  PTWRequest.create({
    id: 'ptw-101',
    ptwNumber: 'PTW-2026-1015-01',
    workerId: 'w-1',
    workerName: 'Nguyen Van An',
    taskName: 'A동 스크러버 배관 고소 용접 및 플랜지 교체',
    location: 'A동 화학탱크 상부 배관',
    workDate: '2026-10-15',
    hazardFactors: '추락 위험(높이 4.5m), 잔류 유해가스 노출, 화재/스파크',
    safetyMeasures: '안전대 착용 체결, 송풍기 환기 가동, 분말 소화기 2개 배치, 비상신호수 배치',
    status: 'REQUESTED', // 승인 대기
    workerSignedAt: '2026-10-15T08:30:00Z',
  }),
  PTWRequest.create({
    id: 'ptw-102',
    ptwNumber: 'PTW-2026-1014-04',
    workerId: 'w-2',
    workerName: 'Batbayar Bold',
    taskName: 'C동 슬러지 압착기 모터 구동축 그리스 주입',
    location: 'C동 환경정화동',
    workDate: '2026-10-14',
    hazardFactors: '회전체 협착 위험',
    safetyMeasures: '전원 차단 후 LOTO 체결 완료, 인터록 점검',
    status: 'APPROVED',
    approvedBy: '김공장장 (관리자)',
    workerSignedAt: '2026-10-14T08:10:00Z',
    approvedAt: '2026-10-14T08:25:00Z',
  }),
];

const INITIAL_SOS: SOSAlert[] = [
  SOSAlert.create({
    id: 'sos-999',
    workerId: 'w-1',
    workerName: 'Nguyen Van An (응우옌 안)',
    phoneNumber: '010-3456-7890',
    location: 'A동 스크러버 배관 3구역',
    message: '배관에서 자극성 가스 누출 의심, 즉시 환기 및 현장 대피 지원 요청!',
    status: 'TRIGGERED', // 활성 긴급 상황 -> 상단 Alert Bar 점멸!
    triggeredAt: '2026-10-15T09:20:00.000Z',
  }),
];

const INITIAL_INSPECTIONS: Inspection[] = [
  Inspection.create({
    id: 'insp-101',
    equipmentId: 'eq-1',
    equipmentName: 'A동 렌더링 쿠커 #1',
    workerId: 'w-1',
    workerName: 'Nguyen Van An',
    data: { temperature: 136.5, pressure: 2.8, steam_leak: '정상(누설 없음)' },
    thresholds: [{ metric: 'temperature', max: 130 }],
    isAbnormal: true, // 기준치 130도 초과!
    abnormalNotes: '[temperature] 기준치 초과 (측정: 136.5, 최대기준: 130)',
    inspectedAt: '2026-10-15T08:45:00.000Z',
  }),
  Inspection.create({
    id: 'insp-102',
    equipmentId: 'eq-3',
    equipmentName: '폐수처리장 슬러지 탈수 압착기',
    workerId: 'w-2',
    workerName: 'Batbayar Bold',
    data: { pressure: 2.0, noise: '정상', vibration: '정상' },
    isAbnormal: false,
    inspectedAt: '2026-10-15T07:10:00.000Z',
  }),
];

const INITIAL_WORK_REPORTS: WorkReport[] = [
  new WorkReport({
    id: 'rep-1',
    workerId: 'w-1',
    workerName: 'Nguyen Van An',
    taskName: '스크러버 배관 가스켓 패킹 교체 작업',
    location: 'A동 2층 배관라인',
    beforeImg: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    afterImg: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    description: '노후된 가스켓 탈거 후 고내열 테플론 패킹으로 신규 체결 및 누설 테스트 완료함.',
    reportedAt: '2026-10-15T11:20:00Z',
  }),
  new WorkReport({
    id: 'rep-2',
    workerId: 'w-2',
    workerName: 'Batbayar Bold',
    taskName: '슬러지 이송 펌프 이물질 제거 및 방청 도포',
    location: 'C동 펌프실',
    beforeImg: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    afterImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    description: '흡입관 막힘 이물질 3.5kg 수거 완료 및 임펠러 부식 방지 코팅 작업 완료.',
    reportedAt: '2026-10-14T16:45:00Z',
  }),
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: '외국인 근로자 체류기간 연장허가 신청서 (출입국 표준 서식 34호)',
    category: 'VISA',
    fileName: '외국인체류기간연장_신청서_표준서식.hwp',
    fileSize: '1.2 MB',
    downloadCount: 38,
    uploadedAt: '2026-09-15',
  },
  {
    id: 'doc-2',
    title: '유해화학물질 취급자 특수건강검진 사후관리 표준 가이드',
    category: 'HEALTH',
    fileName: '특수건강검진_결과표_및_사후조치_양식.pdf',
    fileSize: '2.8 MB',
    downloadCount: 52,
    uploadedAt: '2026-09-20',
  },
  {
    id: 'doc-3',
    title: '중대재해처벌법 대비 일일 TBM(작업전안전점검) 대장 표준 서식',
    category: 'COMPLIANCE',
    fileName: '노동부_제출용_TBM_안전서명대장_양식.xlsx',
    fileSize: '840 KB',
    downloadCount: 120,
    uploadedAt: '2026-10-01',
  },
];

export class LocalStateStore {
  private static instance: LocalStateStore;
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = {
      workers: INITIAL_WORKERS,
      equipmentList: INITIAL_EQUIPMENT,
      templates: INITIAL_TEMPLATES,
      ptwList: INITIAL_PTW,
      sosList: INITIAL_SOS,
      inspections: INITIAL_INSPECTIONS,
      workReports: INITIAL_WORK_REPORTS,
      signatures: [],
      documents: INITIAL_DOCUMENTS,
      notifications: [
        {
          id: 'notif-1',
          type: 'SOS',
          title: '긴급 SOS 호출 발생',
          message: 'Nguyen Van An 근로자가 A동 스크러버 배관 3구역에서 SOS를 요청했습니다.',
          timestamp: '12분 전',
          isRead: false,
          priority: 'CRITICAL',
        },
        {
          id: 'notif-2',
          type: 'PTW',
          title: 'PTW 안전작업허가 승인 요청',
          message: 'Nguyen Van An 근로자가 고소 용접 작업 승인을 요청했습니다.',
          timestamp: '1시간 전',
          isRead: false,
          priority: 'HIGH',
        },
      ],
      currentRole: 'admin',
      activeWorkerId: 'w-1',
      currentLanguage: 'ko',
    };
  }

  public static getInstance(): LocalStateStore {
    if (!LocalStateStore.instance) {
      LocalStateStore.instance = new LocalStateStore();
    }
    return LocalStateStore.instance;
  }

  public getState(): StoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public approveWorker(workerId: string) {
    this.state.workers = this.state.workers.map((w) => {
      if (w.id === workerId) {
        w.approve();
      }
      return w;
    });
    this.notify();
  }

  public addWorker(worker: Worker) {
    this.state.workers = [worker, ...this.state.workers];
    this.notify();
  }

  public approvePTW(ptwId: string, adminId: string = '김공장장 (관리자)') {
    this.state.ptwList = this.state.ptwList.map((p) => {
      if (p.id === ptwId) {
        p.approve(adminId);
      }
      return p;
    });
    this.notify();
  }

  public rejectPTW(ptwId: string, reason: string, adminId: string = '김공장장 (관리자)') {
    this.state.ptwList = this.state.ptwList.map((p) => {
      if (p.id === ptwId) {
        p.reject(adminId, reason);
      }
      return p;
    });
    this.notify();
  }

  public addPTW(ptw: PTWRequest) {
    this.state.ptwList = [ptw, ...this.state.ptwList];
    this.notify();
  }

  public triggerSOS(workerId: string, workerName: string, phoneNumber: string, location: string, message: string) {
    const sos = SOSAlert.create({
      id: 'sos-' + Date.now(),
      workerId,
      workerName,
      phoneNumber,
      location,
      message,
      status: 'TRIGGERED',
    });
    this.state.sosList = [sos, ...this.state.sosList];
    this.state.notifications = [
      {
        id: 'notif-' + Date.now(),
        type: 'SOS',
        title: `긴급 SOS 발생 (${location})`,
        message: `${workerName}: ${message}`,
        timestamp: '방금 전',
        isRead: false,
        priority: 'CRITICAL',
      },
      ...this.state.notifications,
    ];
    this.notify();
  }

  public resolveSOS(sosId: string) {
    this.state.sosList = this.state.sosList.map((s) => {
      if (s.id === sosId) {
        s.resolve();
      }
      return s;
    });
    this.notify();
  }

  public addInspection(inspection: Inspection) {
    this.state.inspections = [inspection, ...this.state.inspections];
    if (inspection.isAbnormal) {
      this.state.notifications = [
        {
          id: 'notif-' + Date.now(),
          type: 'INSPECTION',
          title: `설비 이상 징후 감지`,
          message: `${inspection.equipmentName || '설비'}: ${inspection.abnormalNotes}`,
          timestamp: '방금 전',
          isRead: false,
          priority: 'HIGH',
        },
        ...this.state.notifications,
      ];
    }
    this.notify();
  }

  public addSignature(sig: Signature) {
    this.state.signatures = [sig, ...this.state.signatures];
    this.notify();
  }

  public addWorkReport(report: WorkReport) {
    this.state.workReports = [report, ...this.state.workReports];
    this.notify();
  }

  public addEquipmentQR(eq: EquipmentQR) {
    this.state.equipmentList = [eq, ...this.state.equipmentList];
    this.notify();
  }

  public addTemplate(tpl: Template) {
    this.state.templates = [tpl, ...this.state.templates];
    this.notify();
  }

  public setRole(role: 'admin' | 'worker') {
    this.state.currentRole = role;
    this.notify();
  }

  public setActiveWorker(workerId: string) {
    this.state.activeWorkerId = workerId;
    this.notify();
  }

  public setLanguage(lang: string) {
    this.state.currentLanguage = lang;
    this.notify();
  }
}
