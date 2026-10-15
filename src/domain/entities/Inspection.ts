export interface InspectionThreshold {
  metric: string;
  min?: number;
  max?: number;
  expectedText?: string;
}

export interface InspectionProps {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  workerId: string;
  workerName: string;
  data: Record<string, string | number | boolean>;
  thresholds?: InspectionThreshold[];
  isAbnormal?: boolean;
  abnormalNotes?: string;
  inspectedAt?: string;
}

export class Inspection {
  public readonly id: string;
  public readonly equipmentId: string;
  public readonly equipmentName?: string;
  public readonly workerId: string;
  public readonly workerName: string;
  public readonly data: Record<string, string | number | boolean>;
  public readonly isAbnormal: boolean;
  public readonly abnormalNotes: string;
  public readonly inspectedAt: string;

  private constructor(props: InspectionProps) {
    this.id = props.id;
    this.equipmentId = props.equipmentId;
    this.equipmentName = props.equipmentName;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.data = props.data;

    let abnormal = props.isAbnormal ?? false;
    const notes: string[] = props.abnormalNotes ? [props.abnormalNotes] : [];

    if (props.thresholds && props.thresholds.length > 0) {
      for (const th of props.thresholds) {
        const val = this.data[th.metric];
        if (typeof val === 'number') {
          if (th.max !== undefined && val > th.max) {
            abnormal = true;
            notes.push(`[${th.metric}] 기준치 초과 (측정: ${val}, 최대기준: ${th.max})`);
          }
          if (th.min !== undefined && val < th.min) {
            abnormal = true;
            notes.push(`[${th.metric}] 기준치 미달 (측정: ${val}, 최소기준: ${th.min})`);
          }
        }
      }
    }

    this.isAbnormal = abnormal;
    this.abnormalNotes = notes.join('; ');
    this.inspectedAt = props.inspectedAt || new Date().toISOString();
  }

  public static create(props: InspectionProps): Inspection {
    return new Inspection(props);
  }
}
