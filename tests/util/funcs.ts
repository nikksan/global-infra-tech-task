import { randomBytes } from 'node:crypto';

export async function catchError(handler: (...args: Array<unknown>) => Promise<unknown>) {
    let caughtErr: Error | null = null;

    try {
        await handler();
    } catch (err) {
        caughtErr = err as Error;
    }

    return caughtErr;
}

export function generateRandomId(): string {
    return randomBytes(12).toString('hex');
}
