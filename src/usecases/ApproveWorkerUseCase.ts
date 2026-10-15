import { Worker } from '@/domain/entities/Worker';
import { IWorkerRepository } from '@/usecases/ports/IWorkerRepository';

export interface ApproveWorkerDTO {
  workerId: string;
  adminId: string;
}

export class ApproveWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(dto: ApproveWorkerDTO): Promise<Worker> {
    const worker = await this.workerRepository.findById(dto.workerId);
    if (!worker) {
      throw new Error(`Worker with id ${dto.workerId} not found`);
    }

    worker.approve();
    await this.workerRepository.update(worker);
    return worker;
  }
}
