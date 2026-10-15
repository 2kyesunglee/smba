export type PTWStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface PTWProps {
  id: string;
  ptwNumber: string;
  workerId: string;
  workerName: string;
  taskName: string;
  location: string;
  workDate: string;
  hazardFactors: string;
  safetyMeasures: string;
  status?: PTWStatus;
  approvedBy?: string;
  workerSignedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export class PTWRequest {
  public readonly id: string;
  public readonly ptwNumber: string;
  public readonly workerId: string;
  public readonly workerName: string;
  public readonly taskName: string;
  public readonly location: string;
  public readonly workDate: string;
  public readonly hazardFactors: string;
  public readonly safetyMeasures: string;
  private _status: PTWStatus;
  public approvedBy?: string;
  public workerSignedAt?: string;
  public approvedAt?: string;
  public rejectionReason?: string;
  public readonly createdAt: string;

  private constructor(props: PTWProps) {
    this.id = props.id;
    this.ptwNumber = props.ptwNumber;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.taskName = props.taskName;
    this.location = props.location;
    this.workDate = props.workDate;
    this.hazardFactors = props.hazardFactors;
    this.safetyMeasures = props.safetyMeasures;
    this._status = props.status || 'REQUESTED';
    this.approvedBy = props.approvedBy;
    this.workerSignedAt = props.workerSignedAt || new Date().toISOString();
    this.approvedAt = props.approvedAt;
    this.rejectionReason = props.rejectionReason;
    this.createdAt = props.createdAt || new Date().toISOString();
  }

  public static create(props: PTWProps): PTWRequest {
    return new PTWRequest(props);
  }

  public get status(): PTWStatus {
    return this._status;
  }

  public approve(adminId: string): void {
    this._status = 'APPROVED';
    this.approvedBy = adminId;
    this.approvedAt = new Date().toISOString();
  }

  public reject(adminId: string, reason: string): void {
    this._status = 'REJECTED';
    this.approvedBy = adminId;
    this.rejectionReason = reason;
    this.approvedAt = new Date().toISOString();
  }
}
