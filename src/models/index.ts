// Export all models and entities
// TODO: Create these model files
// export * from './User';
// export * from './Product';
// export * from './Order';

// Common model types
export interface ModelId {
  id: string;
}

export interface TimestampedModel {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteModel {
  deletedAt?: Date;
  isDeleted: boolean;
}

export type BaseModel = ModelId & TimestampedModel; 