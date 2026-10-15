import { IWorkerRepository } from '@/usecases/ports/IWorkerRepository';

export interface RequestAppLinkDTO {
  phoneNumber: string;
  deviceToken?: string;
  appLanguage?: string;
}

export interface RequestAppLinkResult {
  success: boolean;
  workerId: string;
  workerName: string;
  status: string;
  message: string;
}

export class RequestAppLinkUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(dto: RequestAppLinkDTO): Promise<RequestAppLinkResult> {
    const worker = await this.workerRepository.findByPhoneNumber(dto.phoneNumber);
    if (!worker) {
      throw new Error(`Worker not found with phone number: ${dto.phoneNumber}`);
    }

    return {
      success: true,
      workerId: worker.id,
      workerName: worker.name,
      status: worker.status,
      message:
        worker.status === 'ACTIVE'
          ? '계정이 이미 연동되어 있습니다.'
          : '관리자 승인 대기 중입니다. 승인 즉시 앱 사용이 가능합니다.',
    };
  }
}
