import { Worker } from '@/domain/entities/Worker';
import { IWorkerRepository } from '@/usecases/ports/IWorkerRepository';

export interface RegisterWorkerDTO {
  id?: string;
  name: string;
  koreanName?: string;
  alienRegNumber?: string;
  phoneNumber: string;
  nationality: string;
  visaType: string;
  gender?: 'M' | 'F';
  contractStartDate: string;
  contractEndDate: string;
  departureDate?: string;
  reEntryAllowed?: boolean;
  specialHealthCheckDate?: string;
}

export class RegisterWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(dto: RegisterWorkerDTO): Promise<Worker> {
    const existing = await this.workerRepository.findByPhoneNumber(dto.phoneNumber);
    if (existing) {
      throw new Error(`Worker with phone number ${dto.phoneNumber} already exists`);
    }

    const workerId = dto.id || 'w-' + Math.random().toString(36).substring(2, 9);
    const worker = Worker.create({
      ...dto,
      id: workerId,
      status: 'PENDING_APPROVAL',
    });

    await this.workerRepository.save(worker);
    return worker;
  }
}
