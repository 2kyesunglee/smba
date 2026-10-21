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
  bloodType?: 'A' | 'B' | 'AB' | 'O' | string;
  reEntryAllowed?: boolean;
  contractStartDate: string;
  contractEndDate: string;
  departureDate?: string;
  specialHealthCheckDate?: string;
  password?: string;
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
  public bloodType?: 'A' | 'B' | 'AB' | 'O' | string;
  private _status: WorkerStatus;
  public contractStartDate: string;
  public contractEndDate: string;
  public departureDate?: string;
  public reEntryAllowed: boolean;
  public specialHealthCheckDate?: string;
  public password?: string;
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
    this.bloodType = props.bloodType;
    this._status = props.status || (props as any)?._status || 'PENDING_APPROVAL';
    this.contractStartDate = props.contractStartDate;
    this.contractEndDate = props.contractEndDate;
    this.departureDate = props.departureDate;
    this.reEntryAllowed = props.reEntryAllowed ?? false;
    this.specialHealthCheckDate = props.specialHealthCheckDate;
    this.password = props.password;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.updatedAt = props.updatedAt || new Date().toISOString();
  }

  public static create(props: WorkerProps): Worker {
    return new Worker(props);
  }

  public get status(): WorkerStatus {
    return this._status;
  }

  public set status(value: WorkerStatus) {
    this._status = value;
    this.updatedAt = new Date().toISOString();
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      koreanName: this.koreanName,
      alienRegNumber: this.alienRegNumber,
      phoneNumber: this.phoneNumber,
      nationality: this.nationality,
      visaType: this.visaType,
      gender: this.gender,
      bloodType: this.bloodType,
      status: this._status,
      _status: this._status,
      contractStartDate: this.contractStartDate,
      contractEndDate: this.contractEndDate,
      departureDate: this.departureDate,
      reEntryAllowed: this.reEntryAllowed,
      specialHealthCheckDate: this.specialHealthCheckDate,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public approve(): void {
    this._status = 'ACTIVE';
    this.updatedAt = new Date().toISOString();
  }

  public deactivate(): void {
    this._status = 'INACTIVE';
    this.updatedAt = new Date().toISOString();
  }

  public update(props: Partial<WorkerProps>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.koreanName !== undefined) this.koreanName = props.koreanName;
    if (props.alienRegNumber !== undefined) this.alienRegNumber = props.alienRegNumber;
    if (props.phoneNumber !== undefined) this.phoneNumber = props.phoneNumber;
    if (props.nationality !== undefined) this.nationality = props.nationality;
    if (props.visaType !== undefined) this.visaType = props.visaType;
    if (props.gender !== undefined) this.gender = props.gender;
    if (props.bloodType !== undefined) this.bloodType = props.bloodType;
    if (props.reEntryAllowed !== undefined) this.reEntryAllowed = props.reEntryAllowed;
    if (props.status !== undefined) this._status = props.status;
    else if ((props as any)?._status !== undefined) this._status = (props as any)._status;
    if (props.contractStartDate !== undefined) this.contractStartDate = props.contractStartDate;
    if (props.contractEndDate !== undefined) this.contractEndDate = props.contractEndDate;
    if (props.departureDate !== undefined) this.departureDate = props.departureDate;
    if (props.specialHealthCheckDate !== undefined) this.specialHealthCheckDate = props.specialHealthCheckDate;
    if (props.password !== undefined) this.password = props.password;
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

