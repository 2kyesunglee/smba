import { NextResponse } from 'next/server';

// Server-side shared state for multi-device sync (smartphone mobile <-> PC admin web)
// Use globalThis to persist during hot-reloads in Node environment
const globalKey = Symbol.for('smba.serverSharedState');
const globalObj = globalThis as any;
if (!globalObj[globalKey]) {
  globalObj[globalKey] = null;
}

function mergeById<T extends { id: string }>(
  currentList: T[] = [],
  incomingList: T[] = [],
  mergeItem?: (curr: T, inc: T) => T
): T[] {
  const map = new Map<string, T>();
  
  currentList.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });

  incomingList.forEach((inc) => {
    if (inc && inc.id) {
      const existing = map.get(inc.id);
      if (existing) {
        map.set(inc.id, mergeItem ? mergeItem(existing, inc) : { ...existing, ...inc });
      } else {
        map.set(inc.id, inc);
      }
    }
  });

  return Array.from(map.values());
}

function mergePtw(curr: any, inc: any) {
  // If either has APPROVED or REJECTED status, prioritize that terminal status
  if (inc.status === 'APPROVED' || inc.status === 'REJECTED') {
    return { ...curr, ...inc };
  }
  if (curr.status === 'APPROVED' || curr.status === 'REJECTED') {
    return { ...inc, ...curr };
  }
  return { ...curr, ...inc };
}

function mergeEquipmentLog(curr: any, inc: any) {
  if (inc.status === 'APPROVED' || inc.status === 'REJECTED') {
    return { ...curr, ...inc };
  }
  if (curr.status === 'APPROVED' || curr.status === 'REJECTED') {
    return { ...inc, ...curr };
  }
  return { ...curr, ...inc };
}

function mergePushHistory(curr: any, inc: any) {
  if (inc.status === 'CONFIRMED' || inc.status === 'DELIVERED') {
    return { ...curr, ...inc };
  }
  return { ...inc, ...curr };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: globalObj[globalKey],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body && typeof body === 'object') {
      const current = globalObj[globalKey] || {};

      const mergedPtwList = Array.isArray(body.ptwList)
        ? mergeById(current.ptwList || [], body.ptwList, mergePtw)
        : current.ptwList;

      const mergedEquipmentUsageLogs = Array.isArray(body.equipmentUsageLogs)
        ? mergeById(current.equipmentUsageLogs || [], body.equipmentUsageLogs, mergeEquipmentLog)
        : current.equipmentUsageLogs;

      const mergedPushHistories = Array.isArray(body.pushHistories)
        ? mergeById(current.pushHistories || [], body.pushHistories, mergePushHistory)
        : current.pushHistories;

      const mergedWorkers = Array.isArray(body.workers)
        ? mergeById(current.workers || [], body.workers)
        : current.workers;

      const mergedSafetyMaterials = Array.isArray(body.safetyMaterials)
        ? mergeById(current.safetyMaterials || [], body.safetyMaterials)
        : current.safetyMaterials;

      const mergedWorkReports = Array.isArray(body.workReports)
        ? mergeById(current.workReports || [], body.workReports)
        : current.workReports;

      const mergedInspections = Array.isArray(body.inspections)
        ? mergeById(current.inspections || [], body.inspections)
        : current.inspections;

      globalObj[globalKey] = {
        ...current,
        ...body,
        ptwList: mergedPtwList,
        equipmentUsageLogs: mergedEquipmentUsageLogs,
        pushHistories: mergedPushHistories,
        workers: mergedWorkers,
        safetyMaterials: mergedSafetyMaterials,
        workReports: mergedWorkReports,
        inspections: mergedInspections,
        lastUpdatedAt: new Date().toISOString(),
      };
    }
    return NextResponse.json({
      success: true,
      data: globalObj[globalKey],
      message: 'Server sync completed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

