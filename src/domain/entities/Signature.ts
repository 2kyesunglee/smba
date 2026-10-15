export type SignatureRefType = 'TBM' | 'SAFETY_EDUCATION' | 'PTW' | 'LOTO';

export interface SignatureProps {
  id: string;
  workerId: string;
  workerName: string;
  referenceType: SignatureRefType;
  referenceId: string;
  referenceTitle: string;
  signatureDataUrl: string;
  signedAt?: string;
}

export class Signature {
  public readonly id: string;
  public readonly workerId: string;
  public readonly workerName: string;
  public readonly referenceType: SignatureRefType;
  public readonly referenceId: string;
  public readonly referenceTitle: string;
  public readonly signatureDataUrl: string;
  public readonly signedAt: string;

  constructor(props: SignatureProps) {
    this.id = props.id;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.referenceType = props.referenceType;
    this.referenceId = props.referenceId;
    this.referenceTitle = props.referenceTitle;
    this.signatureDataUrl = props.signatureDataUrl;
    this.signedAt = props.signedAt || new Date().toISOString();
  }
}
