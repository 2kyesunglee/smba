export interface WorkReportProps {
  id: string;
  workerId: string;
  workerName: string;
  taskName: string;
  location: string;
  beforeImg?: string;
  afterImg?: string;
  beforeImgs?: string[];
  afterImgs?: string[];
  description: string;
  beforeDescription?: string;
  afterDescription?: string;
  reportedAt?: string;
}

export class WorkReport {
  public readonly id: string;
  public readonly workerId: string;
  public readonly workerName: string;
  public readonly taskName: string;
  public readonly location: string;
  public readonly beforeImg: string;
  public readonly afterImg: string;
  public readonly beforeImgs: string[];
  public readonly afterImgs: string[];
  public readonly description: string;
  public readonly beforeDescription?: string;
  public readonly afterDescription?: string;
  public readonly reportedAt: string;

  constructor(props: WorkReportProps) {
    this.id = props.id;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.taskName = props.taskName;
    this.location = props.location;
    this.beforeImg = props.beforeImg || (props.beforeImgs && props.beforeImgs[0]) || '';
    this.afterImg = props.afterImg || (props.afterImgs && props.afterImgs[0]) || '';
    this.beforeImgs = props.beforeImgs && props.beforeImgs.length > 0 ? props.beforeImgs : [this.beforeImg].filter(Boolean);
    this.afterImgs = props.afterImgs && props.afterImgs.length > 0 ? props.afterImgs : [this.afterImg].filter(Boolean);
    this.description = props.description;
    this.beforeDescription = props.beforeDescription;
    this.afterDescription = props.afterDescription;
    this.reportedAt = props.reportedAt || new Date().toISOString();
  }
}

