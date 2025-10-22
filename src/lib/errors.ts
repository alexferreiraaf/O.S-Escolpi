import { EventEmitter } from 'events';
import type { DocumentReference, CollectionReference } from 'firebase/firestore';

// A simple, shared event emitter instance.
export const errorEmitter = new EventEmitter();

export type FirestoreOperation = 'create' | 'read' | 'update' | 'delete' | 'listen';

export class FirestorePermissionError extends Error {
  operation: FirestoreOperation;
  ref: DocumentReference | CollectionReference;
  resource?: any;

  constructor(
    operation: FirestoreOperation, 
    ref: DocumentReference | CollectionReference, 
    resource?: any
  ) {
    const message = `Firestore Permission Denied on operation '${operation}' for path '${ref.path}'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.operation = operation;
    this.ref = ref;
    this.resource = resource;
    
    // This is for environments that may not support Error.captureStackTrace
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, FirestorePermissionError);
    }
  }
}
