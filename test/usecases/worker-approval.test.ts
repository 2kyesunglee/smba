import { describe, it, expect } from 'vitest';
import { RegisterWorkerUseCase } from '@/usecases/RegisterWorkerUseCase';
import { RequestAppLinkUseCase } from '@/usecases/RequestAppLinkUseCase';
import { ApproveWorkerUseCase } from '@/usecases/ApproveWorkerUseCase';
import { InMemoryWorkerRepository } from '@/infrastructure/repositories/InMemoryWorkerRepository';

describe('Worker Smartphone Account Link Workflow', () => {
  it('should allow admin to register worker, worker to request app link, and admin to approve', async () => {
    const workerRepo = new InMemoryWorkerRepository();
    const registerUseCase = new RegisterWorkerUseCase(workerRepo);
    const requestLinkUseCase = new RequestAppLinkUseCase(workerRepo);
    const approveUseCase = new ApproveWorkerUseCase(workerRepo);

    // 1. 관리자가 인사기록카드 등록
    const worker = await registerUseCase.execute({
      name: 'Batbayar Bold',
      koreanName: '바트',
      alienRegNumber: '920304-5987654',
      phoneNumber: '010-8888-7777',
      nationality: 'MN',
      visaType: 'E-9',
      contractStartDate: '2024-03-01',
      contractEndDate: '2027-02-28',
    });

    expect(worker.status).toBe('PENDING_APPROVAL');

    // 2. 근로자가 앱에서 본인 스마트폰 번호로 가입 요청
    const linkResult = await requestLinkUseCase.execute({
      phoneNumber: '010-8888-7777',
      deviceToken: 'device-token-abc',
      appLanguage: 'mn',
    });

    expect(linkResult.success).toBe(true);
    expect(linkResult.workerId).toBe(worker.id);

    // 3. 관리자가 웹에서 승인
    const approvedWorker = await approveUseCase.execute({
      workerId: worker.id,
      adminId: 'admin-1',
    });

    expect(approvedWorker.status).toBe('ACTIVE');

    // 4. 저장소 조회 시 ACTIVE 확인
    const saved = await workerRepo.findById(worker.id);
    expect(saved?.status).toBe('ACTIVE');
  });

  it('should reject link if phone number is not found in HR master DB', async () => {
    const workerRepo = new InMemoryWorkerRepository();
    const requestLinkUseCase = new RequestAppLinkUseCase(workerRepo);

    await expect(
      requestLinkUseCase.execute({
        phoneNumber: '010-0000-9999',
        deviceToken: 'token-unknown',
        appLanguage: 'vi',
      })
    ).rejects.toThrow('Worker not found with phone number: 010-0000-9999');
  });
});
