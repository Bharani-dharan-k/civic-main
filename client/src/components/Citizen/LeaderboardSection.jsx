import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Target, TrendingUp, Users, Crown } from 'lucide-react';

// Leaderboard Section Component
const LeaderboardSection = () => {
  const topReporters = [
    { 
      id: 1, 
      name: 'Rajesh Kumar', 
      points: 2450, 
      reports: 45, 
      resolved: 38, 
      rank: 1,
      avatar: '👨',
      badges: ['🏆', '⭐', '🎯']
    },
    { 
      id: 2, 
      name: 'Priya Sharma', 
      points: 2120, 
      reports: 38, 
      resolved: 32, 
      rank: 2,
      avatar: '👩',
      badges: ['🥈', '⭐', '🚀']
    },
    { 
      id: 3, 
      name: 'You', 
      points: 1250, 
      reports: 12, 
      resolved: 8, 
      rank: 15,
      avatar: '😊',
      badges: ['🌟', '📍']
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Reporter',
      description: 'Submit your first complaint',
      icon: '🎯',
      earned: true,
      progress: 100
    },
    {
      id: 2,
      title: 'Problem Solver',
      description: 'Get 5 complaints resolved',
      icon: '🔧',
      earned: true,
      progress: 100
    },
    {
      id: 3,
      title: 'Community Guardian',
      description: 'Submit 25 complaints',
      icon: '🛡️',
      earned: false,
      progress: 48
    },
    {
      id: 4,
      title: 'Super Reporter',
      description: 'Earn 2000 points',
      icon: '🚀',
      earned: false,
      progress: 62
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Your Rank Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Current Ranking</h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-3xl font-bold">15</p>
                <p className="text-purple-100 text-sm">Rank</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">1,250</p>
                <p className="text-purple-100 text-sm">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">67%</p>
                <p className="text-purple-100 text-sm">Resolution Rate</p>
              </div>
            </div>
          </div>
          <div className="text-6xl">🏅</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Reporters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Top Reporters This Month
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {topReporters.map((reporter, index) => (
              <div 
                key={reporter.id} 
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  reporter.name === 'You' 
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    {reporter.avatar}
                  </div>
                  {reporter.rank <= 3 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {reporter.rank}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800">{reporter.name}</h4>
                    {reporter.name === 'You' && (
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{reporter.points} pts</span>
                    <span>{reporter.reports} reports</span>
                    <span>{reporter.resolved} resolved</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {reporter.badges.map((badge, i) => (
                      <span key={i} className="text-lg">{badge}</span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-800">#{reporter.rank}</p>
                  <p className="text-xs text-gray-500">Rank</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Medal className="w-5 h-5 mr-2 text-orange-500" />
              Your Achievements
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-xl border-2 transition-all ${
                  achievement.earned 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                      {achievement.earned && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                          ✓ Earned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    
                    {!achievement.earned && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points System */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          How to Earn Points
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl mb-2">📝</div>
            <h4 className="font-semibold text-blue-800 mb-1">Submit Report</h4>
            <p className="text-2xl font-bold text-blue-600">+50 pts</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl mb-2">✅</div>
            <h4 className="font-semibold text-green-800 mb-1">Report Resolved</h4>
            <p className="text-2xl font-bold text-green-600">+100 pts</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl mb-2">👍</div>
            <h4 className="font-semibold text-purple-800 mb-1">Community Support</h4>
            <p className="text-2xl font-bold text-purple-600">+25 pts</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardSection;
