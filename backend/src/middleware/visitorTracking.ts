
// import { prisma } from '../lib/prisma';

// export const visitorTrackingMiddleware = async (req: any, res: any, next: NextFunction) => {
//   try {
//     // Extract visitor information
//     const visitorData = {
//       ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
//       userAgent: req.get('User-Agent'),
//       page: req.path,
//       referer: req.get('Referer')
//     };

//     // Try to store visitor data in database
//     try {
//       await prisma.visitor.create({
//         data: {
//           ipAddress: visitorData.ipAddress,
//           userAgent: visitorData.userAgent,
//           page: visitorData.page,
//           referer: visitorData.referer,
//           count: '1'
//         }
//       });

//       // Update daily stats
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const existingStats = await prisma.dailyStats.findUnique({
//         where: { date: today }
//       });

//       if (existingStats) {
//         await prisma.dailyStats.update({
//           where: { date: today },
//           data: {
//             totalVisits: existingStats.totalVisits + 1
//           }
//         });
//       } else {
//         await prisma.dailyStats.create({
//           data: {
//             date: today,
//             totalVisits: 1,
//             uniqueVisits: 1,
//             pageViews: JSON.stringify({ [req.path]: 1 })
//           }
//         });
//       }
//     } catch (dbError) {
//       console.log('📊 Visitor tracking disabled - database not available');
//       // Continue without storing visitor data
//     }

//   } catch (error) {
//     // Don't let visitor tracking errors break the main application
//     console.error('Visitor tracking error:', error);
//   }

//   next();
// };
