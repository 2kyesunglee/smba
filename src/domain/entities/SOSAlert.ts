export type SOSStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface SOSProps {
  id: string;
  workerId?: string;
  workerName: string;
  phoneNumber: string;
  location: string;
  message?: string;
  status?: SOSStatus;
  triggeredAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export class SOSAlert {
  public readonly id: string;
  public readonly workerId?: string;
  public readonly workerName: string;
  public readonly phoneNumber: string;
  public readonly location: string;
  public readonly message?: string;
  private _status: SOSStatus;
  public readonly triggeredAt: string;
  public acknowledgedAt?: string;
  public resolvedAt?: string;

  private constructor(props: SOSProps) {
    this.id = props.id;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.phoneNumber = props.phoneNumber;
    this.location = props.location;
    this.message = props.message;
    this._status = props.status || 'TRIGGERED';
    this.triggeredAt = props.triggeredAt || new Date().toISOString();
    this.acknowledgedAt = props.acknowledgedAt;
    this.resolvedAt = props.resolvedAt;
  }

  public static create(props: SOSProps): SOSAlert {
    return new SOSAlert(props);
  }

  public get status(): SOSStatus {
    return this._status;
  }

  public isTriggered(): boolean {
    return this._status === 'TRIGGERED';
  }

  public acknowledge(): void {
    this._status = 'ACKNOWLEDGED';
    this.acknowledgedAt = new Date().toISOString();
  }

  public resolve(): void {
    this._status = 'RESOLVED';
    this.resolvedAt = new Date().toISOString();
  }
}
