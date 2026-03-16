import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

const router = Router();

// GET /shop/items
router.get('/items', requireAuth, async (_req: Request, res: Response) => {
  const items = await prisma.shopItem.findMany({ where: { isActive: true } });
  return res.json(items);
});

// GET /shop/items/:id
router.get('/items/:id', requireAuth, async (req: Request, res: Response) => {
  const item = await prisma.shopItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  return res.json(item);
});

const redeemSchema = z.object({
  shopItemId: z.string().cuid(),
  size:       z.string().optional(),
});

// POST /shop/redeem
router.post('/redeem', requireAuth, async (req: Request, res: Response) => {
  const parsed = redeemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { shopItemId, size } = parsed.data;

  try {
    const redemption = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const item = await tx.shopItem.findUnique({ where: { id: shopItemId } });
      if (!item || !item.isActive) throw new Error('ITEM_NOT_FOUND');

      const user = await tx.user.findUnique({ where: { id: req.user!.id } });
      if (!user || user.totalPoints < item.pointCost) throw new Error('INSUFFICIENT_POINTS');

      await tx.user.update({
        where: { id: req.user!.id },
        data:  { totalPoints: { decrement: item.pointCost } },
      });
      return tx.redemption.create({
        data:    { userId: req.user!.id, shopItemId, size: size ?? null, pointsSpent: item.pointCost },
        include: { shopItem: true },
      });
    });
    return res.status(201).json(redemption);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ITEM_NOT_FOUND')      return res.status(404).json({ error: 'Item not found' });
      if (err.message === 'INSUFFICIENT_POINTS') return res.status(402).json({ error: 'Insufficient points' });
    }
    throw err;
  }
});

export default router;
