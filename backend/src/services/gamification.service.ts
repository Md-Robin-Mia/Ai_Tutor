import StudentProfile from '../models/StudentProfile.model';

interface XPReward {
  xp: number;
  reason: string;
  newLevel?: number;
  newBadges?: string[];
}

export class GamificationService {
  private readonly XP_PER_LEVEL = 100;
  private readonly BADGES = {
    FIRST_LESSON: 'First Lesson Completed',
    WEEK_STREAK: '7-Day Study Streak',
    MONTH_STREAK: '30-Day Study Streak',
    QUIZ_MASTER: 'Quiz Master - 10 Perfect Scores',
    PYTHON_BEGINNER: 'Python Beginner Master',
    FAST_LEARNER: 'Fast Learner',
    PERSISTENT: 'Persistent Student',
    GOAL_ACHIEVER: 'Goal Achiever',
    HELPER: 'Helpful Peer',
    PROJECT_BUILDER: 'Project Builder'
  };

  async awardXP(userId: string, xp: number, reason: string): Promise<XPReward> {
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Student profile not found');
    }

    const oldLevel = profile.currentLevel;
    
    profile.xp += xp;
    const newLevel = Math.floor(profile.xp / this.XP_PER_LEVEL) + 1;
    
    const leveledUp = newLevel > oldLevel;
    if (leveledUp) {
      profile.currentLevel = newLevel;
    }

    const newBadges = await this.checkAndAwardBadges(profile);
    
    await profile.save();

    return {
      xp,
      reason,
      newLevel: leveledUp ? newLevel : undefined,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    };
  }

  private async checkAndAwardBadges(profile: any): Promise<string[]> {
    const newBadges: string[] = [];

    if (profile.studySessions.length === 1 && !profile.badges.includes(this.BADGES.FIRST_LESSON)) {
      profile.badges.push(this.BADGES.FIRST_LESSON);
      newBadges.push(this.BADGES.FIRST_LESSON);
    }

    if (profile.studyStreak >= 7 && !profile.badges.includes(this.BADGES.WEEK_STREAK)) {
      profile.badges.push(this.BADGES.WEEK_STREAK);
      newBadges.push(this.BADGES.WEEK_STREAK);
    }

    if (profile.studyStreak >= 30 && !profile.badges.includes(this.BADGES.MONTH_STREAK)) {
      profile.badges.push(this.BADGES.MONTH_STREAK);
      newBadges.push(this.BADGES.MONTH_STREAK);
    }

    if (profile.projectsCompleted >= 1 && !profile.badges.includes(this.BADGES.PROJECT_BUILDER)) {
      profile.badges.push(this.BADGES.PROJECT_BUILDER);
      newBadges.push(this.BADGES.PROJECT_BUILDER);
    }

    const completedGoals = profile.goals.filter((g: any) => g.isCompleted).length;
    if (completedGoals >= 3 && !profile.badges.includes(this.BADGES.GOAL_ACHIEVER)) {
      profile.badges.push(this.BADGES.GOAL_ACHIEVER);
      newBadges.push(this.BADGES.GOAL_ACHIEVER);
    }

    return newBadges;
  }

  async updateStreak(userId: string): Promise<number> {
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Student profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStudy = profile.lastStudyDate ? new Date(profile.lastStudyDate) : null;
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);
    }

    if (!lastStudy) {
      profile.studyStreak = 1;
    } else {
      const diffDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return profile.studyStreak;
      } else if (diffDays === 1) {
        profile.studyStreak += 1;
      } else {
        profile.studyStreak = 1;
      }
    }

    profile.lastStudyDate = new Date();
    await profile.save();

    return profile.studyStreak;
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const topStudents = await StudentProfile.find()
      .sort({ xp: -1 })
      .limit(limit)
      .populate('userId', 'name avatar');

    return topStudents.map((student, index) => ({
      rank: index + 1,
      name: (student.userId as any).name,
      avatar: (student.userId as any).avatar,
      xp: student.xp,
      level: student.currentLevel,
      badges: student.badges.length
    }));
  }

  calculateXPForActivity(activityType: string, performance?: number): number {
    const baseXP: { [key: string]: number } = {
      'lesson_complete': 20,
      'quiz_complete': 30,
      'quiz_perfect': 50,
      'daily_login': 5,
      'goal_complete': 100,
      'project_submit': 150,
      'help_peer': 25
    };

    let xp = baseXP[activityType] || 10;

    if (performance && performance >= 90) {
      xp *= 1.5;
    } else if (performance && performance >= 80) {
      xp *= 1.2;
    }

    return Math.floor(xp);
  }
}

export default new GamificationService();
