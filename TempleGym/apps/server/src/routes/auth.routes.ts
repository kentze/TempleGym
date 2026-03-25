import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateOtp, createOtpRequest, verifyOtp } from '../services/otp.service';
import { sendOtpEmail } from '../services/email.service';
import { signToken } from '../services/jwt.service';
import { prisma } from '../lib/prisma';

const router = Router();

// In-memory rate limit: max 3 OTP requests per email per 10 minutes
const otpAttempts = new Map<string, { count: number; resetAt: number }>();

const requestOtpSchema = z.object({
  email: z.string().email().endsWith('@temple.edu', { message: 'Must be a @temple.edu address' }),
});

const verifyOtpSchema = z.object({
  email: z.string().email().endsWith('@temple.edu', { message: 'Must be a @temple.edu address' }),
  code: z.string().length(6),
});

// POST /auth/request-otp
router.post('/request-otp', async (req: Request, res: Response) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email } = parsed.data;
  const now       = Date.now();
  const attempts  = otpAttempts.get(email);

  if (attempts && attempts.resetAt > now && attempts.count >= 3) {
    return res.status(429).json({ error: 'Too many OTP requests. Please wait before trying again.' });
  }
  otpAttempts.set(email, {
    count:   (attempts && attempts.resetAt > now ? attempts.count : 0) + 1,
    resetAt: attempts?.resetAt && attempts.resetAt > now ? attempts.resetAt : now + 10 * 60 * 1000,
  });

  const code = generateOtp();
  await createOtpRequest(email, code);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[OTP DEV] ${email} => ${code}`);
  } else {
    await sendOtpEmail(email, code);
  }

  return res.status(200).json({ message: 'OTP sent' });
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, code } = parsed.data;
  const valid = await verifyOtp(email, code);
  if (!valid) return res.status(401).json({ error: 'Invalid or expired OTP' });

  const user  = await prisma.user.upsert({ where: { email }, update: {}, create: { email } });
  const token = signToken({ userId: user.id, email: user.email });
  return res.status(200).json({ token, user });
});

export default router;
