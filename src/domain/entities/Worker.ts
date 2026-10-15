export type WorkerStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'LEAVE';

export interface WorkerProps {
  id: string;
  name: string;
  koreanName?: string;
  alienRegNumber?: string;
  phoneNumber: string;
  nationality: string;
  visaType: string;
  gender?: 'M' | 'F';
  status?: WorkerStatus;
  contractStartDate: string;
  contractEndDate: string;
  departureDate?: string;
  reEntryAllowed?: boolean;
  specialHealthCheckDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Worker {
  public readonly id: string;
  public name: string;
  public koreanName?: string;
  public alienRegNumber?: string;
  public phoneNumber: string;
  public nationality: string;
  public visaType: string;
  public gender: 'M' | 'F';
  private _status: WorkerStatus;
  public contractStartDate: string;
  public contractEndDate: string;
  public departureDate?: string;
  public reEntryAllowed: boolean;
  public specialHealthCheckDate?: string;
  public readonly createdAt: string;
  public updatedAt: string;

  private constructor(props: WorkerProps) {
    this.id = props.id;
    this.name = props.name;
    this.koreanName = props.koreanName;
    this.alienRegNumber = props.alienRegNumber;
    this.phoneNumber = props.phoneNumber;
    this.nationality = props.nationality;
    this.visaType = props.visaType;
    this.gender = props.gender || 'M';
    this._status = props.status || 'PENDING_APPROVAL';
    this.contractStartDate = props.contractStartDate;
    this.contractEndDate = props.contractEndDate;
    this.departureDate = props.departureDate;
    this.reEntryAllowed = props.reEntryAllowed ?? false;
    this.specialHealthCheckDate = props.specialHealthCheckDate;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  public static create(props: WorkerProps): Worker {
    return new Worker(props);
  }

  public get status(): WorkerStatus {
    return this._status;
  }

  public approve(): void {
    this._status = 'ACTIVE';
    this.updatedAt = new Date().toISOString();
  }

  public deactivate(): void {
    this._status = 'INACTIVE';
    this.updatedAt = new Date().toISOString();
  }

  public getDaysUntilContractEnd(referenceDate?: Date): number {
    const ref = referenceDate || new Date('2026-10-15T00:00:00Z');
    const end = new Date(this.contractEndDate);
    const diffTime = end.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isVisaExpiringSoon(days?: number): boolean {
    const remaining = days !== undefined ? days : this.getDaysUntilContractEnd();
    // 60일(2개월) 이내면 만료 임박
    return remaining >= 0 && remaining <= 65;
  }
}
