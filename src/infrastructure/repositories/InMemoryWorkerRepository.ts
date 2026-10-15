import { Worker } from '@/domain/entities/Worker';
import { IWorkerRepository } from '@/usecases/ports/IWorkerRepository';

export class InMemoryWorkerRepository implements IWorkerRepository {
  private workers: Map<string, Worker> = new Map();

  async findById(id: string): Promise<Worker | null> {
    return this.workers.get(id) || null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Worker | null> {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    for (const worker of this.workers.values()) {
      const workerCleaned = worker.phoneNumber.replace(/[^0-9]/g, '');
      if (workerCleaned === cleaned) {
        return worker;
      }
    }
    return null;
  }

  async findAll(): Promise<Worker[]> {
    return Array.from(this.workers.values());
  }

  async save(worker: Worker): Promise<void> {
    this.workers.set(worker.id, worker);
  }

  async update(worker: Worker): Promise<void> {
    this.workers.set(worker.id, worker);
  }

  async delete(id: string): Promise<void> {
    this.workers.delete(id);
  }
}
