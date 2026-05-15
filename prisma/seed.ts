import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type QSeed = {
  prompt: string;
  type: "MULTIPLE_CHOICE" | "INPUT";
  topic: "BINARY" | "DECIMAL" | "OCTAL" | "HEXADECIMAL" | "CONVERSION";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  choices?: string[];
  answer: string;
  poolKind: "PRE_TEST" | "POST_TEST" | "PRACTICE";
  explanation?: string;
};

const lessons = [
  {
    slug: "intro-number-systems",
    title: "Intro to Number Systems",
    topic: "DECIMAL",
    order: 1,
    description: "What positional number systems are and why computers use base-2.",
    content: `# Intro to Number Systems

Number systems represent numbers using a fixed set of digits.
- **Decimal (Base 10)** — digits 0–9. The system we use every day.
- **Binary (Base 2)** — digits 0 and 1. Used by computers.
- **Octal (Base 8)** — digits 0–7.
- **Hexadecimal (Base 16)** — digits 0–9 and A–F.

Each position in a number has a place value that is a power of the base.`,
  },
  {
    slug: "binary-basics",
    title: "Binary Basics",
    topic: "BINARY",
    order: 2,
    description: "Reading binary, place values, and small conversions.",
    content: `# Binary Basics

Binary uses only 0 and 1. Each position is a power of 2.

Example: \`1011\` (binary)
- 1 × 2³ = 8
- 0 × 2² = 0
- 1 × 2¹ = 2
- 1 × 2⁰ = 1

Total = **11** in decimal.

**Practice:** What is \`1101\` in decimal? (Answer: 13)`,
  },
  {
    slug: "hex-fundamentals",
    title: "Hex Fundamentals",
    topic: "HEXADECIMAL",
    order: 3,
    description: "Hex digits 0–F and quick conversions to binary.",
    content: `# Hex Fundamentals

Hex uses 0–9 plus A=10, B=11, C=12, D=13, E=14, F=15.

A neat trick: each hex digit maps to exactly 4 binary bits.

Example: \`2F\` (hex)
- 2 = 0010
- F = 1111
- Combined → \`00101111\` = 47 in decimal.`,
  },
  {
    slug: "octal-overview",
    title: "Octal Overview",
    topic: "OCTAL",
    order: 4,
    description: "Octal digits and grouping binary by threes.",
    content: `# Octal Overview

Octal uses digits 0–7. Each octal digit maps to **3** binary bits.

Example: \`52\` (octal)
- 5 = 101
- 2 = 010
- Combined → \`101010\` = 42 in decimal.`,
  },
  {
    slug: "conversion-mastery",
    title: "Conversion Mastery",
    topic: "CONVERSION",
    order: 5,
    description: "Step-by-step methods for converting between any two bases.",
    content: `# Conversion Mastery

**Decimal → Binary (division method):**
1. Divide the number by 2.
2. Write down the remainder.
3. Repeat with the quotient until it's 0.
4. Read the remainders **bottom to top**.

**Decimal → Hex:** same method but divide by 16.

**Binary → Hex:** group bits into 4s from the right.

**Hex → Binary:** expand each hex digit into 4 bits.`,
  },
];

const achievements = [
  { code: "FIRST_GAME", title: "First Steps", description: "Play your first game.", iconKey: "sparkles", xpReward: 25 },
  { code: "STREAK_5", title: "Hot Streak", description: "Hit a 5-answer streak.", iconKey: "flame", xpReward: 50 },
  { code: "STREAK_10", title: "On Fire", description: "Hit a 10-answer streak.", iconKey: "fire", xpReward: 100 },
  { code: "SCORE_500", title: "High Roller", description: "Reach 500 in a single game.", iconKey: "trophy", xpReward: 150 },
];

const badges = [
  { code: "BEGINNER_BIT", title: "Beginner Bit", description: "Welcome to BaseQuest.", rankCode: "BEGINNER_BIT", minXp: 0, iconKey: "bit" },
  { code: "BINARY_EXPLORER", title: "Binary Explorer", description: "250 XP earned.", rankCode: "BINARY_EXPLORER", minXp: 250, iconKey: "binary" },
  { code: "HEX_HERO", title: "Hex Hero", description: "750 XP earned.", rankCode: "HEX_HERO", minXp: 750, iconKey: "hex" },
  { code: "CONVERSION_WIZARD", title: "Conversion Wizard", description: "2000 XP earned.", rankCode: "CONVERSION_WIZARD", minXp: 2000, iconKey: "wizard" },
];

function makeQ(p: QSeed): QSeed {
  return p;
}

const preTest: QSeed[] = [
  makeQ({ prompt: "What is 1010 in decimal?", type: "MULTIPLE_CHOICE", topic: "BINARY", difficulty: "EASY", choices: ["8", "10", "12", "14"], answer: "10", poolKind: "PRE_TEST", explanation: "1×8 + 0×4 + 1×2 + 0×1 = 10" }),
  makeQ({ prompt: "Convert 13 (decimal) to binary.", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "1101", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "What is 0xFF in decimal?", type: "MULTIPLE_CHOICE", topic: "HEXADECIMAL", difficulty: "MEDIUM", choices: ["127", "200", "255", "256"], answer: "255", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "Convert 42 (decimal) to hex.", type: "INPUT", topic: "HEXADECIMAL", difficulty: "MEDIUM", answer: "2A", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "What is 11111111 in decimal?", type: "INPUT", topic: "BINARY", difficulty: "MEDIUM", answer: "255", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "Which is the binary equivalent of decimal 7?", type: "MULTIPLE_CHOICE", topic: "BINARY", difficulty: "EASY", choices: ["110", "111", "101", "011"], answer: "111", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "How many bits make one hex digit?", type: "MULTIPLE_CHOICE", topic: "HEXADECIMAL", difficulty: "EASY", choices: ["2", "3", "4", "8"], answer: "4", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "What is 17 (octal) in decimal?", type: "INPUT", topic: "OCTAL", difficulty: "MEDIUM", answer: "15", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "Convert 1100 (binary) to hex.", type: "INPUT", topic: "CONVERSION", difficulty: "MEDIUM", answer: "C", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "Which base does each digit have 16 possible values?", type: "MULTIPLE_CHOICE", topic: "DECIMAL", difficulty: "EASY", choices: ["Binary", "Octal", "Decimal", "Hexadecimal"], answer: "Hexadecimal", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "Convert 25 (decimal) to binary.", type: "INPUT", topic: "BINARY", difficulty: "MEDIUM", answer: "11001", poolKind: "PRE_TEST" }),
  makeQ({ prompt: "What is A3 (hex) in decimal?", type: "INPUT", topic: "HEXADECIMAL", difficulty: "HARD", answer: "163", poolKind: "PRE_TEST" }),
];

const postTest: QSeed[] = [
  makeQ({ prompt: "Convert 1001 (binary) to decimal.", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "9", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Convert 31 (decimal) to binary.", type: "INPUT", topic: "BINARY", difficulty: "MEDIUM", answer: "11111", poolKind: "POST_TEST" }),
  makeQ({ prompt: "What is 0x1F in decimal?", type: "MULTIPLE_CHOICE", topic: "HEXADECIMAL", difficulty: "MEDIUM", choices: ["15", "31", "32", "33"], answer: "31", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Convert 100 (decimal) to hex.", type: "INPUT", topic: "HEXADECIMAL", difficulty: "MEDIUM", answer: "64", poolKind: "POST_TEST" }),
  makeQ({ prompt: "What is 11010 (binary) in decimal?", type: "INPUT", topic: "BINARY", difficulty: "MEDIUM", answer: "26", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Convert 75 (octal) to decimal.", type: "INPUT", topic: "OCTAL", difficulty: "MEDIUM", answer: "61", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Which is binary for hex C?", type: "MULTIPLE_CHOICE", topic: "CONVERSION", difficulty: "EASY", choices: ["1010", "1011", "1100", "1101"], answer: "1100", poolKind: "POST_TEST" }),
  makeQ({ prompt: "What is 200 (decimal) in hex?", type: "INPUT", topic: "HEXADECIMAL", difficulty: "HARD", answer: "C8", poolKind: "POST_TEST" }),
  makeQ({ prompt: "What is 101101 (binary) in hex?", type: "INPUT", topic: "CONVERSION", difficulty: "HARD", answer: "2D", poolKind: "POST_TEST" }),
  makeQ({ prompt: "How many distinct values can 1 byte (8 bits) represent?", type: "MULTIPLE_CHOICE", topic: "BINARY", difficulty: "EASY", choices: ["128", "256", "512", "1024"], answer: "256", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Convert 0b1110 to decimal.", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "14", poolKind: "POST_TEST" }),
  makeQ({ prompt: "Convert FF (hex) to binary.", type: "INPUT", topic: "CONVERSION", difficulty: "HARD", answer: "11111111", poolKind: "POST_TEST" }),
];

// Practice pool (used by Conversion Challenge game)
const practice: QSeed[] = [
  makeQ({ prompt: "5 (decimal) → binary", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "101", poolKind: "PRACTICE" }),
  makeQ({ prompt: "10 (decimal) → binary", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "1010", poolKind: "PRACTICE" }),
  makeQ({ prompt: "1011 (binary) → decimal", type: "INPUT", topic: "BINARY", difficulty: "EASY", answer: "11", poolKind: "PRACTICE" }),
  makeQ({ prompt: "20 (decimal) → hex", type: "INPUT", topic: "HEXADECIMAL", difficulty: "EASY", answer: "14", poolKind: "PRACTICE" }),
  makeQ({ prompt: "B (hex) → binary", type: "INPUT", topic: "CONVERSION", difficulty: "EASY", answer: "1011", poolKind: "PRACTICE" }),
  makeQ({ prompt: "1E (hex) → decimal", type: "INPUT", topic: "HEXADECIMAL", difficulty: "MEDIUM", answer: "30", poolKind: "PRACTICE" }),
  makeQ({ prompt: "60 (decimal) → hex", type: "INPUT", topic: "HEXADECIMAL", difficulty: "MEDIUM", answer: "3C", poolKind: "PRACTICE" }),
  makeQ({ prompt: "111000 (binary) → decimal", type: "INPUT", topic: "BINARY", difficulty: "MEDIUM", answer: "56", poolKind: "PRACTICE" }),
];

async function main() {
  console.log("Seeding BaseQuest…");

  // Lessons
  for (const l of lessons) {
    await prisma.lesson.upsert({
      where: { slug: l.slug },
      create: l,
      update: { title: l.title, content: l.content, description: l.description, order: l.order, topic: l.topic },
    });
  }

  // Questions: wipe pools first to avoid duplicates on re-seed
  await prisma.question.deleteMany({});
  for (const q of [...preTest, ...postTest, ...practice]) {
    await prisma.question.create({
      data: {
        prompt: q.prompt,
        type: q.type,
        topic: q.topic,
        difficulty: q.difficulty,
        choices: q.choices ? JSON.stringify(q.choices) : null,
        answer: q.answer,
        poolKind: q.poolKind,
        explanation: q.explanation,
      },
    });
  }

  // Achievements
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      create: a,
      update: { title: a.title, description: a.description, iconKey: a.iconKey, xpReward: a.xpReward },
    });
  }

  // Badges
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      create: b,
      update: { title: b.title, description: b.description, rankCode: b.rankCode, minXp: b.minXp, iconKey: b.iconKey },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
