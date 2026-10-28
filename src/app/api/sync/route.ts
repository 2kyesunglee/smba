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

const versionKey = Symbol.for('smba.serverVersion');
if (!globalObj[versionKey]) {
  globalObj[versionKey] = '1';
}

export async function GET(request?: Request) {
  const currentData = globalObj[globalKey];
  const version = globalObj[versionKey] || '1';
  const etag = `"${version}"`;

  // Check client If-None-Match header
  if (request && typeof request.headers?.get === 'function') {
    const clientEtag = request.headers.get('if-none-match');
    if (clientEtag && (clientEtag === etag || clientEtag === version)) {
      // 304 Not Modified: 서버 데이터가 전혀 변경되지 않았음 (페이로드 0바이트, CDN 캐시 히트)
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, no-cache, must-revalidate',
        },
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      version,
      data: currentData,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'ETag': etag,
        'Cache-Control': 'private, no-cache, must-revalidate',
      },
    }
  );
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

      const updatedWorkers = Array.isArray(body.workers)
        ? body.workers
        : current.workers;

      const mergedSafetyMaterials = Array.isArray(body.safetyMaterials)
        ? body.safetyMaterials
        : current.safetyMaterials;

      const mergedInspectionTargets = Array.isArray(body.inspectionTargets)
        ? body.inspectionTargets
        : current.inspectionTargets;

      const mergedEquipmentTypes = Array.isArray(body.equipmentTypes)
        ? body.equipmentTypes
        : current.equipmentTypes;

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
        workers: updatedWorkers,
        safetyMaterials: mergedSafetyMaterials,
        inspectionTargets: mergedInspectionTargets,
        equipmentTypes: mergedEquipmentTypes,
        workReports: mergedWorkReports,
        inspections: mergedInspections,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Bump server version
      globalObj[versionKey] = Date.now().toString();
    }

    const version = globalObj[versionKey] || '1';
    const etag = `"${version}"`;

    // Data Projection: 성공 메타데이터만 반환하여 네트워크 페이로드 최소화 (전체 DB 재전송 방지)
    return NextResponse.json(
      {
        success: true,
        version,
        lastUpdatedAt: globalObj[globalKey]?.lastUpdatedAt,
        message: 'Server sync completed successfully',
      },
      {
        status: 200,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

