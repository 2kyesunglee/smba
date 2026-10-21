export type EquipmentUsageStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface EquipmentUsageLogProps {
  id: string;
  equipmentType: string; // '지게차' | '고소작업대' | '스카이' | '크레인' | 사용자정의
  equipmentNumber?: string;
  workerId: string;
  workerName: string;
  purpose: string;
  startTime: string;
  endTime: string;
  location?: string;
  hasLicense?: boolean;
  preCheckCompleted?: boolean;
  status?: EquipmentUsageStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class EquipmentUsageLog {
  public readonly id: string;
  public equipmentType: string;
  public equipmentNumber?: string;
  public workerId: string;
  public workerName: string;
  public purpose: string;
  public startTime: string;
  public endTime: string;
  public location?: string;
  public hasLicense: boolean;
  public preCheckCompleted: boolean;
  private _status: EquipmentUsageStatus;
  public approvedBy?: string;
  public approvedAt?: string;
  public rejectReason?: string;
  public readonly createdAt: string;
  public updatedAt: string;

  private constructor(props: EquipmentUsageLogProps) {
    this.id = props.id;
    this.equipmentType = props.equipmentType;
    this.equipmentNumber = props.equipmentNumber;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.purpose = props.purpose;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.location = props.location;
    this.hasLicense = props.hasLicense ?? true;
    this.preCheckCompleted = props.preCheckCompleted ?? true;
    this._status = props.status || (props as any)?._status || 'REQUESTED';
    this.approvedBy = props.approvedBy;
    this.approvedAt = props.approvedAt;
    this.rejectReason = props.rejectReason;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  public static create(props: EquipmentUsageLogProps): EquipmentUsageLog {
    return new EquipmentUsageLog(props);
  }

  public get status(): EquipmentUsageStatus {
    return this._status;
  }

  public set status(val: EquipmentUsageStatus) {
    this._status = val;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      equipmentType: this.equipmentType,
      equipmentNumber: this.equipmentNumber,
      workerId: this.workerId,
      workerName: this.workerName,
      purpose: this.purpose,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      hasLicense: this.hasLicense,
      preCheckCompleted: this.preCheckCompleted,
      status: this._status,
      _status: this._status,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      rejectReason: this.rejectReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public approve(adminName: string): void {
    this._status = 'APPROVED';
    this.approvedBy = adminName;
    this.approvedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  public reject(reason: string, adminName: string): void {
    this._status = 'REJECTED';
    this.rejectReason = reason;
    this.approvedBy = adminName;
    this.updatedAt = new Date().toISOString();
  }

  public complete(): void {
    this._status = 'COMPLETED';
    this.updatedAt = new Date().toISOString();
  }
}
