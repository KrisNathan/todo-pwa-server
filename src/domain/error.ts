export class NotFoundError extends Error {}

export class InvalidDataError extends Error {} // maps to 400

export class OutOfDateDataError extends InvalidDataError {}
