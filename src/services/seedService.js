import { db, firebaseReady } from "../firebase";
import {
  addDoc,
  collection,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";

const SEED_VERSION = "talentmesh_seed_v2";

const countCollection = async (name) => {
  const snap = await getCountFromServer(collection(db, name));
  return snap.data().count;
};

/**
 * Seeds professional demo data into empty Firestore collections.
 * Runs once per browser per seed version when an admin loads the dashboard.
 */
export async function seedPlatformDataIfEmpty(adminUser) {
  if (!firebaseReady || !db || !adminUser?.uid) {
    return { seeded: false, reason: "Firebase not ready" };
  }

  if (localStorage.getItem(SEED_VERSION) === "done") {
    return { seeded: false, reason: "Already seeded this session" };
  }

  try {
    const [skillsCount, oppsCount, projectsCount, announcementsCount, resourcesCount] =
      await Promise.all([
        countCollection("skills"),
        countCollection("opportunities"),
        countCollection("projects"),
        countCollection("announcements"),
        countCollection("learningResources"),
      ]);

    const now = serverTimestamp();
    const admin = {
      uid: adminUser.uid,
      name: adminUser.name || "TalentMesh Admin",
    };

    let seededAny = false;

    const skillData = [
      { name: "React", category: "Programming", description: "Frontend library for building user interfaces" },
      { name: "Python", category: "Programming", description: "Versatile language for data science and backend" },
      { name: "UI/UX Design", category: "Design", description: "User interface and experience design" },
      { name: "Machine Learning", category: "Data Science", description: "Building predictive models and AI systems" },
      { name: "Node.js", category: "Programming", description: "JavaScript runtime for server-side development" },
      { name: "Public Speaking", category: "Soft Skills", description: "Effective communication and presentation" },
    ];

    if (skillsCount === 0) {
      for (const skill of skillData) {
        await addDoc(collection(db, "skills"), {
          ...skill,
          createdById: admin.uid,
          createdByName: admin.name,
          createdAt: now,
          updatedAt: now,
        });
      }
      seededAny = true;
    }

    const opportunityData = [
      {
        type: "internship",
        title: "Frontend Developer Intern — TechNova Labs",
        description:
          "Join our product team to build responsive web applications using React and TypeScript. Work on real features used by 10,000+ students.",
        skillsRequired: ["React", "JavaScript", "UI/UX Design"],
        location: "Bangalore / Hybrid",
        deadline: "2026-08-15",
      },
      {
        type: "hackathon",
        title: "Campus Innovation Hackathon 2026",
        description:
          "48-hour hackathon focused on ed-tech and sustainability. Teams of 2–4. Prizes worth ₹2,00,000.",
        skillsRequired: ["Python", "React", "Machine Learning"],
        location: "On Campus",
        deadline: "2026-07-01",
      },
      {
        type: "job",
        title: "Graduate Software Engineer — CloudScale",
        description:
          "Full-time role for final-year students. Work on distributed systems, APIs, and cloud infrastructure.",
        skillsRequired: ["Node.js", "Python", "React"],
        location: "Remote",
        deadline: "2026-09-30",
      },
    ];

    if (oppsCount === 0) {
      for (const opp of opportunityData) {
        await addDoc(collection(db, "opportunities"), {
          ...opp,
          postedById: admin.uid,
          postedByName: admin.name,
          postedByEmail: adminUser.email || "",
          createdAt: now,
          updatedAt: now,
        });
      }
      seededAny = true;
    }

    const projectData = [
      {
        title: "Smart Campus Navigator",
        description:
          "Mobile-friendly web app helping new students find classrooms, labs, and events on campus using interactive maps.",
        status: "Open",
        members: [],
        skills: ["React", "UI/UX Design"],
      },
      {
        title: "Peer Learning Network",
        description:
          "Platform module for students to form study groups, share notes, and schedule revision sessions by subject.",
        status: "In Progress",
        members: [],
        skills: ["Node.js", "React"],
      },
      {
        title: "Resume Portfolio Builder",
        description:
          "Open-source toolkit that generates polished student portfolios from TalentMesh profile data.",
        status: "Open",
        members: [],
        skills: ["React", "UI/UX Design"],
      },
    ];

    if (projectsCount === 0) {
      for (const proj of projectData) {
        await addDoc(collection(db, "projects"), {
          ...proj,
          createdById: admin.uid,
          createdByName: admin.name,
          createdAt: now,
          updatedAt: now,
        });
      }
      seededAny = true;
    }

    const announcementData = [
      {
        title: "Welcome to TalentMesh",
        message:
          "TalentMesh is now live! Explore opportunities, connect with peers, join projects, and build your professional network.",
        createdById: admin.uid,
        createdByName: admin.name,
      },
      {
        title: "Profile Completion Drive",
        message:
          "Students with complete profiles receive 3× more connection requests. Add your skills, bio, and education today.",
        createdById: admin.uid,
        createdByName: admin.name,
      },
    ];

    if (announcementsCount === 0) {
      for (const ann of announcementData) {
        await addDoc(collection(db, "announcements"), {
          ...ann,
          createdAt: now,
          updatedAt: now,
        });
      }
      seededAny = true;
    }

    const resourceData = [
      {
        title: "React Official Documentation",
        description: "Comprehensive guide to building UIs with React.",
        url: "https://react.dev",
        type: "documentation",
        category: "Programming",
        createdById: admin.uid,
        createdByName: admin.name,
      },
      {
        title: "Resume Writing for Students",
        description: "Best practices for crafting a standout student resume.",
        url: "https://www.linkedin.com/learning",
        type: "course",
        category: "Career",
        createdById: admin.uid,
        createdByName: admin.name,
      },
      {
        title: "Git & GitHub Crash Course",
        description: "Learn version control essentials for team projects.",
        url: "https://www.youtube.com",
        type: "video",
        category: "Programming",
        createdById: admin.uid,
        createdByName: admin.name,
      },
    ];

    if (resourcesCount === 0) {
      for (const res of resourceData) {
        await addDoc(collection(db, "learningResources"), {
          ...res,
          createdAt: now,
          updatedAt: now,
        });
      }
      seededAny = true;
    }

    if (seededAny) {
      await addDoc(collection(db, "userActivity"), {
        userId: admin.uid,
        userName: admin.name,
        userRole: "admin",
        action: "platform_seeded",
        details: "Platform demo data created for empty collections",
        createdAt: now,
      });
    }

    localStorage.setItem(SEED_VERSION, "done");
    return {
      seeded: seededAny,
      reason: seededAny ? "Seeded empty collections" : "All collections have data",
    };
  } catch (error) {
    console.error("[TalentMesh] Seed error:", error);
    return { seeded: false, reason: error.message };
  }
}

export async function resetSeedFlag() {
  localStorage.removeItem(SEED_VERSION);
}
