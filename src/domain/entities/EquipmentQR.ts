export type QRType = 'LOTO' | 'MSDS' | 'SAFETY_RULES';
export type QRCategory = 'EQUIPMENT' | 'CHEMICAL';

export interface EquipmentQRProps {
  id: string;
  code: string;
  name: string;
  category: QRCategory;
  type: QRType;
  location: string;
  imageUrl?: string;
  cautionNotes: string;
  emergencyProcedures: string;
  isLotoLocked?: boolean;
  activeWorkerName?: string;
  createdAt?: string;
}

export class EquipmentQR {
  public readonly id: string;
  public readonly code: string;
  public name: string;
  public category: QRCategory;
  public type: QRType;
  public location: string;
  public imageUrl?: string;
  public cautionNotes: string;
  public emergencyProcedures: string;
  public isLotoLocked: boolean;
  public activeWorkerName?: string;
  public readonly createdAt: string;

  constructor(props: EquipmentQRProps) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.category = props.category;
    this.type = props.type;
    this.location = props.location;
    this.imageUrl = props.imageUrl;
    this.cautionNotes = props.cautionNotes;
    this.emergencyProcedures = props.emergencyProcedures;
    this.isLotoLocked = props.isLotoLocked ?? (props.type === 'LOTO');
    this.activeWorkerName = props.activeWorkerName;
    this.createdAt = props.createdAt || new Date().toISOString();
  }
}
