// src/common/listeners/auditable-entity.ts
export abstract class AuditableEntity {
  private originalState: any;

  setOriginalState(state: any): void {
    this.originalState = state;
  }

  getOriginalState(): any {
    return this.originalState;
  }
}

export default AuditableEntity;
