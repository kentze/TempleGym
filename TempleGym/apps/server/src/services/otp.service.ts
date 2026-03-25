import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function createOtpRequest(email: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);
  await prisma.otpRequest.create({
    data: { email, code: hashOtp(code), expiresAt },
  });
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const request = await prisma.otpRequest.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!request || request.code !== hashOtp(code)) return false;

  await prisma.otpRequest.update({
    where: { id: request.id },
    data:  { usedAt: new Date() },
  });
  return true;
}
