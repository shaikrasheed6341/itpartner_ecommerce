import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const visitorTrackingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const page = req.path;
    const referer = req.headers.referer;

    // Create visitor record
    await prisma.visitor.create({
      data: {
        ipAddress: ipAddress as string,
        userAgent: userAgent as string,
        page,
        referer: referer as string,
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    if (existingStats) {
      // Update existing stats
      const pageViews = JSON.parse(existingStats.pageViews || '{}') as Record<string, number>;
      pageViews[page] = (pageViews[page] || 0) + 1;

      await prisma.dailyStats.update({
        where: { id: existingStats.id },
        data: {
          totalVisits: existingStats.totalVisits + 1,
          pageViews: JSON.stringify(pageViews),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new daily stats
      const pageViews = { [page]: 1 };
      
      await prisma.dailyStats.create({
        data: {
          date: today,
          totalVisits: 1,
          uniqueVisits: 1,
          pageViews: JSON.stringify(pageViews),
        },
      });
    }

    next();
  } catch (error) {
    console.error('Visitor tracking error:', error);
    // Don't block the request if tracking fails
    next();
  }
};
