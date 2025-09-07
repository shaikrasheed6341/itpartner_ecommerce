import prisma from '../lib/prisma';

export const getVisitorStats = async (req: any, res: any) => {
  try {
    const { days = 7 } = req.query;
    const daysToFetch = parseInt(days);

    // Get daily stats for the specified number of days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    // Get total visitors count
    const totalVisitors = await prisma.visitor.count();

    // Get unique visitors (by IP) for today
    const todayVisitors = await prisma.visitor.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      select: {
        ipAddress: true,
      },
    });

    const uniqueTodayVisitors = new Set(todayVisitors.map(v => v.ipAddress)).size;

    res.json({
      success: true,
      data: {
        today: todayStats ? {
          ...todayStats,
          pageViews: JSON.parse(todayStats.pageViews || '{}'),
        } : {
          totalVisits: 0,
          uniqueVisits: 0,
          pageViews: {},
        },
        dailyStats: dailyStats.map(stat => ({
          ...stat,
          pageViews: JSON.parse(stat.pageViews || '{}'),
        })),
        totalVisitors,
        uniqueTodayVisitors,
      },
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visitor statistics',
    });
  }
};

export const getPageViews = async (req: any, res: any) => {
  try {
    const { page } = req.params;
    const { days = 30 } = req.query;
    const daysToFetch = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    startDate.setHours(0, 0, 0, 0);

    const pageVisits = await prisma.visitor.findMany({
      where: {
        page: `/${page}`,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        page,
        visits: pageVisits.length,
        visitors: pageVisits,
      },
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page views',
    });
  }
};

export const getRecentVisitors = async (req: any, res: any) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const recentVisitors = await prisma.visitor.findMany({
      take: limitNum,
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        ipAddress: true,
        page: true,
        date: true,
        userAgent: true,
      },
    });

    res.json({
      success: true,
      data: {
        visitors: recentVisitors,
      },
    });
  } catch (error) {
    console.error('Error fetching recent visitors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent visitors',
    });
  }
};
