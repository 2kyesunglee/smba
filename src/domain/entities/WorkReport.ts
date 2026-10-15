export interface WorkReportProps {
  id: string;
  workerId: string;
  workerName: string;
  taskName: string;
  location: string;
  beforeImg: string;
  afterImg: string;
  description: string;
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
  public readonly description: string;
  public readonly reportedAt: string;

  constructor(props: WorkReportProps) {
    this.id = props.id;
    this.workerId = props.workerId;
    this.workerName = props.workerName;
    this.taskName = props.taskName;
    this.location = props.location;
    this.beforeImg = props.beforeImg;
    this.afterImg = props.afterImg;
    this.description = props.description;
    this.reportedAt = props.reportedAt || new Date().toISOString();
  }
}
