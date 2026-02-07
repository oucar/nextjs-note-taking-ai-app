import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample journal entries with varied moods and topics
const journalTemplates = [
  // Positive entries
  {
    content: "Had an amazing morning run today! The sunrise was breathtaking, and I managed to beat my personal best time. Feeling incredibly energized and ready to tackle the day. Sometimes the early wake-up is worth it.",
    mood: "energized",
    subject: "morning exercise",
    negative: false,
    summary: "Achieved a personal best during a beautiful sunrise run, feeling motivated.",
    sentimentScore: 8,
  },
  {
    content: "Finally finished the book I've been reading for weeks. The ending was so satisfying! I love that feeling when a story wraps up perfectly. Already looking forward to picking up the next one on my list.",
    mood: "satisfied",
    subject: "reading accomplishment",
    negative: false,
    summary: "Completed a book with a satisfying ending, excited for the next read.",
    sentimentScore: 7,
  },
  {
    content: "Caught up with an old friend over coffee today. We hadn't seen each other in years, but it felt like no time had passed at all. Real friendships truly stand the test of time. Grateful for people who make you feel at home.",
    mood: "grateful",
    subject: "reconnecting with friends",
    negative: false,
    summary: "Reconnected with an old friend, appreciating lasting friendships.",
    sentimentScore: 9,
  },
  {
    content: "Got promoted at work today! All the late nights and extra effort finally paid off. My manager said she's noticed my dedication and growth. Celebrating with a nice dinner tonight!",
    mood: "elated",
    subject: "career milestone",
    negative: false,
    summary: "Received a promotion at work, feeling accomplished and celebratory.",
    sentimentScore: 10,
  },
  {
    content: "Tried cooking a new recipe today - Thai green curry from scratch. It turned out surprisingly well! The kitchen was a mess, but totally worth it. Might experiment more with Asian cuisine.",
    mood: "proud",
    subject: "cooking experiment",
    negative: false,
    summary: "Successfully made Thai green curry for the first time, inspired to cook more.",
    sentimentScore: 6,
  },
  {
    content: "The weather was perfect today, so I spent the afternoon in the park reading and people-watching. Sometimes doing nothing productive is exactly what the soul needs. Feeling recharged.",
    mood: "peaceful",
    subject: "relaxation day",
    negative: false,
    summary: "Enjoyed a peaceful afternoon in the park, feeling mentally refreshed.",
    sentimentScore: 7,
  },
  {
    content: "My code finally works after three days of debugging! Found a subtle race condition that was causing intermittent failures. The satisfaction of solving a tough problem never gets old.",
    mood: "triumphant",
    subject: "debugging victory",
    negative: false,
    summary: "Solved a challenging debugging problem after days of work.",
    sentimentScore: 8,
  },
  
  // Neutral entries
  {
    content: "Regular Monday at work. Had a few meetings, answered emails, made some progress on the project. Nothing particularly exciting, but steady progress is still progress. Need to remember to buy groceries on the way home.",
    mood: "neutral",
    subject: "routine workday",
    negative: false,
    summary: "Uneventful but productive Monday with routine tasks.",
    sentimentScore: 2,
  },
  {
    content: "Spent most of the day organizing my apartment. It's one of those tasks that feels endless while you're doing it, but the result is worth it. Found some old photos that brought back memories.",
    mood: "contemplative",
    subject: "home organization",
    negative: false,
    summary: "Organized apartment and discovered nostalgic items.",
    sentimentScore: 3,
  },
  {
    content: "Had a routine doctor's checkup today. Everything looks normal, which I guess is the best outcome you can hope for. The waiting room was packed though - spent more time there than with the actual doctor.",
    mood: "indifferent",
    subject: "medical checkup",
    negative: false,
    summary: "Completed a routine health checkup with normal results.",
    sentimentScore: 1,
  },
  {
    content: "Watched a documentary about space exploration. It's humbling to think about how vast the universe is and how small our problems seem in comparison. Made me curious to learn more about astronomy.",
    mood: "curious",
    subject: "documentary watching",
    negative: false,
    summary: "Watched a space documentary, felt inspired and humble.",
    sentimentScore: 4,
  },
  
  // Mixed/bittersweet entries  
  {
    content: "Said goodbye to a colleague who's moving to another city for a job opportunity. Happy for them but sad to see them go. The office won't be the same without our coffee breaks and random chats.",
    mood: "bittersweet",
    subject: "colleague farewell",
    negative: false,
    summary: "Said goodbye to a departing colleague, feeling mixed emotions.",
    sentimentScore: 0,
  },
  {
    content: "My project proposal got rejected, but the feedback was actually really constructive. It stings a bit, but I can see where they're coming from. Will revise and try again next quarter.",
    mood: "determined",
    subject: "handling rejection",
    negative: false,
    summary: "Project was rejected but received useful feedback for improvement.",
    sentimentScore: 1,
  },
  {
    content: "Cleaned out my closet and donated a bunch of old clothes. Some had sentimental value, but they were just collecting dust. It's freeing to let go of things, even when it's hard.",
    mood: "reflective",
    subject: "decluttering",
    negative: false,
    summary: "Donated old clothes despite sentimental attachments, feeling lighter.",
    sentimentScore: 3,
  },
  
  // Negative entries
  {
    content: "Terrible day. Overslept, missed an important meeting, and then spilled coffee all over my laptop keyboard. It's one of those days where everything that can go wrong does. Just want to crawl back into bed.",
    mood: "frustrated",
    subject: "everything going wrong",
    negative: true,
    summary: "A series of mishaps including oversleeping and damaging laptop.",
    sentimentScore: -6,
  },
  {
    content: "Feeling really lonely tonight. Everyone seems busy with their own lives, and I'm here scrolling through social media seeing everyone else's highlight reels. Need to remind myself that's not the full picture.",
    mood: "lonely",
    subject: "social isolation",
    negative: true,
    summary: "Struggling with loneliness and social media comparison.",
    sentimentScore: -5,
  },
  {
    content: "Got into an argument with a family member over something trivial that escalated. We both said things we didn't mean. Hate when this happens. Will need to apologize tomorrow when things cool down.",
    mood: "regretful",
    subject: "family conflict",
    negative: true,
    summary: "Had a heated argument with family, feeling bad about it.",
    sentimentScore: -4,
  },
  {
    content: "Couldn't sleep at all last night. Brain just wouldn't shut off, going over every mistake I've made this week. Now I'm exhausted and unproductive. The cycle of anxiety and tiredness is exhausting.",
    mood: "exhausted",
    subject: "insomnia and anxiety",
    negative: true,
    summary: "Struggled with sleeplessness due to anxious overthinking.",
    sentimentScore: -6,
  },
  {
    content: "The project deadline got moved up by a week with no additional resources. Feeling overwhelmed and a bit resentful. Management doesn't seem to understand what's actually involved in the work.",
    mood: "stressed",
    subject: "work pressure",
    negative: true,
    summary: "Frustrated by unrealistic deadline changes at work.",
    sentimentScore: -5,
  },
  {
    content: "My pet hasn't been eating well lately. Took him to the vet and they want to run more tests. Trying not to worry too much, but it's hard not to think about worst-case scenarios.",
    mood: "worried",
    subject: "pet health concerns",
    negative: true,
    summary: "Anxious about pet's health after vet visit.",
    sentimentScore: -4,
  },
  
  // Recovery/hopeful entries
  {
    content: "After weeks of feeling stuck, I think I finally see a way forward. Had a breakthrough moment in therapy today. The path won't be easy, but at least I can see it now.",
    mood: "hopeful",
    subject: "therapy progress",
    negative: false,
    summary: "Made a breakthrough in therapy, feeling optimistic about progress.",
    sentimentScore: 5,
  },
  {
    content: "Started the day feeling anxious about my presentation, but it went better than expected! Got some great questions from the audience and positive feedback from my boss. The anticipation is always worse than the reality.",
    mood: "relieved",
    subject: "overcoming presentation anxiety",
    negative: false,
    summary: "Presentation went well despite initial anxiety, received positive feedback.",
    sentimentScore: 6,
  },
  {
    content: "Finally went for a walk after staying inside for three days. The fresh air and sunlight made such a difference. Sometimes the smallest steps are the hardest but most important ones.",
    mood: "improving",
    subject: "self-care efforts",
    negative: false,
    summary: "Broke a reclusive streak with a walk, feeling better.",
    sentimentScore: 4,
  },
  
  // Creative/learning entries
  {
    content: "Started learning guitar today. My fingers hurt and I can barely switch between two chords, but everyone has to start somewhere. Committed to practicing 15 minutes each day.",
    mood: "motivated",
    subject: "learning guitar",
    negative: false,
    summary: "Began guitar lessons, struggling but committed to practice.",
    sentimentScore: 5,
  },
  {
    content: "Wrote three pages of my novel today! The words were just flowing. These writing sessions are rare, so I'm savoring this creative momentum while it lasts.",
    mood: "inspired",
    subject: "creative writing session",
    negative: false,
    summary: "Had a productive writing session with good creative flow.",
    sentimentScore: 8,
  },
  {
    content: "Attended a workshop on watercolor painting. I'm terrible at it, but there's something meditative about just playing with colors without worrying about the result. Might sign up for more classes.",
    mood: "playful",
    subject: "art workshop",
    negative: false,
    summary: "Enjoyed a watercolor workshop, found the process relaxing.",
    sentimentScore: 6,
  },
  
  // Social entries
  {
    content: "Hosted a small dinner party tonight. The risotto was slightly overcooked and I forgot to buy wine, but no one seemed to mind. The conversation and laughter made up for everything.",
    mood: "content",
    subject: "hosting friends",
    negative: false,
    summary: "Hosted a dinner party with minor issues but great company.",
    sentimentScore: 7,
  },
  {
    content: "Met someone interesting at a networking event. We talked for hours about shared interests in tech and sustainability. Exchanged contacts - hope this leads to something, professionally or personally.",
    mood: "excited",
    subject: "new connection",
    negative: false,
    summary: "Made a promising new connection at a networking event.",
    sentimentScore: 7,
  },
  {
    content: "Family video call today. Despite the occasional tech issues with grandma's internet, it was wonderful to see everyone's faces. Distance makes these moments more precious.",
    mood: "warm",
    subject: "family connection",
    negative: false,
    summary: "Had a meaningful family video call despite technical difficulties.",
    sentimentScore: 6,
  },
  
  // Health/fitness entries
  {
    content: "Hit the gym after a month-long hiatus. Everything hurts, and I had to lower all my weights significantly. Humbling, but glad I went. Consistency is key.",
    mood: "determined",
    subject: "returning to fitness",
    negative: false,
    summary: "Resumed gym workouts after a break, committed to consistency.",
    sentimentScore: 4,
  },
  {
    content: "Tried meditation for the first time using an app. My mind wandered constantly, but the 10 minutes still felt like an accomplishment. They say it gets easier with practice.",
    mood: "curious",
    subject: "starting meditation",
    negative: false,
    summary: "Started meditation practice, struggled but remained open to it.",
    sentimentScore: 3,
  },
];

// Function to generate color from sentiment score
function scoreToColor(score: number): string {
  const s = Math.max(-10, Math.min(10, score));
  const t = (s + 10) / 20;
  let r: number, g: number;
  if (t <= 0.5) {
    r = 255;
    g = Math.round(t * 2 * 255);
  } else {
    r = Math.round((1 - (t - 0.5) * 2) * 255);
    g = 255;
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}00`;
}

// Get random entries for a day (0-5 entries)
function getRandomEntriesForDay(count: number) {
  const entries = [];
  const usedIndexes = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * journalTemplates.length);
    } while (usedIndexes.has(index) && usedIndexes.size < journalTemplates.length);
    
    usedIndexes.add(index);
    entries.push(journalTemplates[index]);
  }
  
  return entries;
}

async function main() {
  console.log('🌱 Starting seed...');
  
  // Find the first user in the database, or create a test user
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found. Creating a test user...');
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        clerkId: 'seed_test_user_' + Date.now(),
        name: 'Test User',
      },
    });
    console.log('Created test user:', user.email);
  } else {
    console.log('Using existing user:', user.email);
  }
  
  // Delete existing entries for this user (optional - comment out if you want to keep existing data)
  const deletedAnalyses = await prisma.entryAnalysis.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${deletedAnalyses.count} existing analyses`);
  
  const deletedEntries = await prisma.journalEntry.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${deletedEntries.count} existing entries`);
  
  // Generate entries for the last 30 days
  const entries: Array<{
    content: string;
    createdAt: Date;
    mood: string;
    subject: string;
    negative: boolean;
    summary: string;
    sentimentScore: number;
  }> = [];
  
  const now = new Date();
  
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    // Random number of entries for this day (0-5, weighted towards 1-3)
    const weights = [0.1, 0.25, 0.3, 0.2, 0.1, 0.05]; // probabilities for 0,1,2,3,4,5 entries
    const rand = Math.random();
    let entriesCount = 0;
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        entriesCount = i;
        break;
      }
    }
    
    if (entriesCount === 0) continue;
    
    const dayEntries = getRandomEntriesForDay(entriesCount);
    
    for (let i = 0; i < dayEntries.length; i++) {
      const template = dayEntries[i];
      
      // Create a date for this entry (spread throughout the day)
      const entryDate = new Date(now);
      entryDate.setDate(entryDate.getDate() - daysAgo);
      entryDate.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
      
      entries.push({
        content: template.content,
        createdAt: entryDate,
        mood: template.mood,
        subject: template.subject,
        negative: template.negative,
        summary: template.summary,
        sentimentScore: template.sentimentScore,
      });
    }
  }
  
  console.log(`Creating ${entries.length} journal entries...`);
  
  // Create entries with their analyses
  for (const entry of entries) {
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content: entry.content,
        createdAt: entry.createdAt,
        updatedAt: entry.createdAt,
        status: 'PUBLISHED',
      },
    });
    
    await prisma.entryAnalysis.create({
      data: {
        entryId: journalEntry.id,
        userId: user.id,
        mood: entry.mood,
        subject: entry.subject,
        negative: entry.negative,
        summary: entry.summary,
        sentimentScore: entry.sentimentScore,
        color: scoreToColor(entry.sentimentScore),
        createdAt: entry.createdAt,
        updatedAt: entry.createdAt,
      },
    });
  }
  
  console.log('✅ Seed completed successfully!');
  console.log(`   Created ${entries.length} journal entries with analyses`);
  
  // Show summary by day
  const summary = entries.reduce((acc, entry) => {
    const dateKey = entry.createdAt.toISOString().split('T')[0];
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Entries per day:');
  Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, count]) => {
      console.log(`   ${date}: ${count} entries`);
    });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
