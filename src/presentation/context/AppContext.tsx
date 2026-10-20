'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocalStateStore, StoreState, SafetyMaterial, MaterialSignature, PushHistoryItem, InspectionTarget, DocumentItem } from '@/infrastructure/storage/LocalStateStore';
import { Worker, WorkerProps } from '@/domain/entities/Worker';
import { PTWRequest } from '@/domain/entities/PTWRequest';
import { Inspection } from '@/domain/entities/Inspection';
import { EquipmentQR } from '@/domain/entities/EquipmentQR';
import { Template } from '@/domain/entities/Template';
import { Signature } from '@/domain/entities/Signature';
import { WorkReport } from '@/domain/entities/WorkReport';
import { EquipmentUsageLog, EquipmentUsageLogProps } from '@/domain/entities/EquipmentUsageLog';

interface AppContextType extends StoreState {
  hasActiveSOS: boolean;
  activeSOSAlerts: StoreState['sosList'];
  pendingPTWCount: number;
  pendingWorkerCount: number;
  abnormalInspectionCount: number;
  expiringVisaCount: number;
  approveWorker: (id: string) => void;
  addWorker: (workerData: Partial<WorkerProps>) => void;
  updateWorker: (id: string, workerData: Partial<WorkerProps>) => void;
  deleteWorker: (id: string) => void;
  approvePTW: (id: string) => void;
  rejectPTW: (id: string, reason: string) => void;
  createPTW: (data: { taskName: string; location: string; hazardFactors: string; safetyMeasures: string }) => void;
  triggerSOS: (location: string, message: string) => void;
  resolveSOS: (id: string) => void;
  submitInspection: (equipmentId: string, equipmentName: string, data: Record<string, any>, isAbnormal?: boolean, abnormalNotes?: string) => void;
  submitSignature: (refType: 'TBM' | 'SAFETY_EDUCATION' | 'PTW', refId: string, refTitle: string, dataUrl: string) => void;
  submitWorkReport: (taskName: string, location: string, beforeImg: string, afterImg: string, description: string, beforeImgs?: string[], afterImgs?: string[], beforeDescription?: string, afterDescription?: string) => void;
  createEquipmentQR: (eq: Partial<EquipmentQR>) => void;
  createTemplate: (tpl: Partial<Template>) => void;
  addSafetyMaterial: (material: SafetyMaterial) => void;
  deleteSafetyMaterial: (id: string) => void;
  signSafetyMaterial: (materialId: string, signature: MaterialSignature) => void;
  addPushHistory: (item: PushHistoryItem) => void;
  updatePushHistory: (id: string, updated: Partial<PushHistoryItem>) => void;
  deletePushHistory: (id: string) => void;
  requestEquipmentUsage: (data: Partial<EquipmentUsageLogProps>) => void;
  approveEquipmentUsage: (id: string, adminName?: string) => void;
  rejectEquipmentUsage: (id: string, reason: string, adminName?: string) => void;
  addEquipmentType: (type: string) => void;
  addInspectionTarget: (target: InspectionTarget) => void;
  deleteInspectionTarget: (id: string) => void;
  addDocument: (doc: DocumentItem) => void;
  deleteDocument: (id: string) => void;
  switchRole: (role: 'admin' | 'worker') => void;
  setActiveWorker: (workerId: string) => void;
  switchLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = LocalStateStore.getInstance();
  const [state, setState] = useState<StoreState>(store.getState());

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return () => unsubscribe();
  }, [store]);

  const activeSOSAlerts = state.sosList.filter((s) => s.status === 'TRIGGERED');
  const hasActiveSOS = activeSOSAlerts.length > 0;
  const pendingPTWCount = state.ptwList.filter((p) => p.status === 'REQUESTED').length;
  const pendingWorkerCount = state.workers.filter((w) => w.status === 'PENDING_APPROVAL').length;
  const abnormalInspectionCount = state.inspections.filter((i) => i.isAbnormal).length;
  const expiringVisaCount = isMounted ? state.workers.filter((w) => w.isVisaExpiringSoon()).length : 2;

  const currentWorker = state.workers.find((w) => w.id === state.activeWorkerId) || state.workers[0];

  const approveWorker = (id: string) => store.approveWorker(id);
  const addWorker = (data: Partial<WorkerProps>) => {
    const newWorker = Worker.create({
      id: 'w-' + Date.now(),
      name: data.name || 'New Worker',
      koreanName: data.koreanName,
      alienRegNumber: data.alienRegNumber || '000000-0000000',
      phoneNumber: data.phoneNumber || '010-0000-0000',
      nationality: data.nationality || 'VN',
      visaType: data.visaType || 'E-9',
      gender: data.gender || 'M',
      bloodType: data.bloodType || 'A',
      reEntryAllowed: data.reEntryAllowed ?? false,
      contractStartDate: data.contractStartDate || '2026-10-15',
      contractEndDate: data.contractEndDate || '2027-12-31',
      departureDate: data.departureDate,
      specialHealthCheckDate: data.specialHealthCheckDate,
    });
    store.addWorker(newWorker);
  };
  const updateWorker = (id: string, data: Partial<WorkerProps>) => store.updateWorker(id, data);
  const deleteWorker = (id: string) => store.deleteWorker(id);

  const approvePTW = (id: string) => store.approvePTW(id);
  const rejectPTW = (id: string, reason: string) => store.rejectPTW(id, reason);
  const createPTW = (data: { taskName: string; location: string; hazardFactors: string; safetyMeasures: string }) => {
    const ptw = PTWRequest.create({
      id: 'ptw-' + Date.now(),
      ptwNumber: `PTW-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      taskName: data.taskName,
      location: data.location,
      workDate: '2026-10-15',
      hazardFactors: data.hazardFactors,
      safetyMeasures: data.safetyMeasures,
      status: 'REQUESTED',
    });
    store.addPTW(ptw);
  };

  const triggerSOS = (location: string, message: string) => {
    store.triggerSOS(currentWorker.id, `${currentWorker.name} (${currentWorker.koreanName || ''})`, currentWorker.phoneNumber, location, message);
  };

  const resolveSOS = (id: string) => store.resolveSOS(id);

  const submitInspection = (equipmentId: string, equipmentName: string, data: Record<string, any>, isAbnormal = false, abnormalNotes = '') => {
    const inspection = Inspection.create({
      id: 'insp-' + Date.now(),
      equipmentId,
      equipmentName,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      data,
      isAbnormal,
      abnormalNotes,
    });
    store.addInspection(inspection);
  };

  const submitSignature = (refType: 'TBM' | 'SAFETY_EDUCATION' | 'PTW', refId: string, refTitle: string, dataUrl: string) => {
    const sig = new Signature({
      id: 'sig-' + Date.now(),
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      referenceType: refType,
      referenceId: refId,
      referenceTitle: refTitle,
      signatureDataUrl: dataUrl,
    });
    store.addSignature(sig);
  };

  const submitWorkReport = (
    taskName: string,
    location: string,
    beforeImg: string,
    afterImg: string,
    description: string,
    beforeImgs?: string[],
    afterImgs?: string[],
    beforeDescription?: string,
    afterDescription?: string
  ) => {
    const report = new WorkReport({
      id: 'rep-' + Date.now(),
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      taskName,
      location,
      beforeImg,
      afterImg,
      beforeImgs: beforeImgs || (beforeImg ? [beforeImg] : []),
      afterImgs: afterImgs || (afterImg ? [afterImg] : []),
      description,
      beforeDescription,
      afterDescription,
    });
    store.addWorkReport(report);
  };

  const createEquipmentQR = (eq: Partial<EquipmentQR>) => {
    const item = new EquipmentQR({
      id: 'eq-' + Date.now(),
      code: eq.code || `QR-${Date.now().toString().slice(-6)}`,
      name: eq.name || '신규 기기',
      category: eq.category || 'EQUIPMENT',
      type: eq.type || 'LOTO',
      location: eq.location || '공장 구역',
      imageUrl: eq.imageUrl,
      cautionNotes: eq.cautionNotes || '안전 수칙 준수',
      emergencyProcedures: eq.emergencyProcedures || '비상정지 후 관리자 통보',
      isLotoLocked: eq.isLotoLocked,
      activeWorkerName: eq.activeWorkerName,
    });
    store.addEquipmentQR(item);
  };

  const createTemplate = (tpl: Partial<Template>) => {
    const item = new Template({
      id: 'tpl-' + Date.now(),
      title: tpl.title || '신규 템플릿',
      type: tpl.type || 'SAFETY_RULES',
      description: tpl.description || '',
      content: tpl.content || {},
    });
    store.addTemplate(item);
  };

  const addSafetyMaterial = (material: SafetyMaterial) => store.addSafetyMaterial(material);
  const deleteSafetyMaterial = (id: string) => store.deleteSafetyMaterial(id);
  const signSafetyMaterial = (materialId: string, signature: MaterialSignature) =>
    store.signSafetyMaterial(materialId, signature);

  const addPushHistory = (item: PushHistoryItem) => store.addPushHistory(item);
  const updatePushHistory = (id: string, updated: Partial<PushHistoryItem>) =>
    store.updatePushHistory(id, updated);
  const deletePushHistory = (id: string) => store.deletePushHistory(id);

  const requestEquipmentUsage = (data: Partial<EquipmentUsageLogProps>) => {
    const log = EquipmentUsageLog.create({
      id: 'eq-log-' + Date.now(),
      equipmentType: data.equipmentType || '지게차',
      equipmentNumber: data.equipmentNumber || '장비 1호',
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      purpose: data.purpose || '공장 내 이송 작업',
      startTime: data.startTime || '2026-10-20 09:00',
      endTime: data.endTime || '2026-10-20 12:00',
      location: data.location || '생산 구역',
      hasLicense: data.hasLicense ?? true,
      preCheckCompleted: data.preCheckCompleted ?? true,
      status: 'REQUESTED',
    });
    store.requestEquipmentUsage(log);
  };

  const approveEquipmentUsage = (id: string, adminName: string = '김공장장 (안전관리자)') =>
    store.approveEquipmentUsage(id, adminName);
  const rejectEquipmentUsage = (id: string, reason: string, adminName: string = '김공장장 (안전관리자)') =>
    store.rejectEquipmentUsage(id, reason, adminName);
  const addEquipmentType = (type: string) => store.addEquipmentType(type);

  const addInspectionTarget = (target: InspectionTarget) => store.addInspectionTarget(target);
  const deleteInspectionTarget = (id: string) => store.deleteInspectionTarget(id);

  const addDocument = (doc: DocumentItem) => store.addDocument(doc);
  const deleteDocument = (id: string) => store.deleteDocument(id);

  const switchRole = (role: 'admin' | 'worker') => store.setRole(role);
  const setActiveWorker = (id: string) => store.setActiveWorker(id);
  const switchLanguage = (lang: string) => store.setLanguage(lang);

  return (
    <AppContext.Provider
      value={{
        ...state,
        hasActiveSOS,
        activeSOSAlerts,
        pendingPTWCount,
        pendingWorkerCount,
        abnormalInspectionCount,
        expiringVisaCount,
        approveWorker,
        addWorker,
        updateWorker,
        deleteWorker,
        approvePTW,
        rejectPTW,
        createPTW,
        triggerSOS,
        resolveSOS,
        submitInspection,
        submitSignature,
        submitWorkReport,
        createEquipmentQR,
        createTemplate,
        addSafetyMaterial,
        deleteSafetyMaterial,
        signSafetyMaterial,
        addPushHistory,
        updatePushHistory,
        deletePushHistory,
        requestEquipmentUsage,
        approveEquipmentUsage,
        rejectEquipmentUsage,
        addEquipmentType,
        addInspectionTarget,
        deleteInspectionTarget,
        addDocument,
        deleteDocument,
        switchRole,
        setActiveWorker,
        switchLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
