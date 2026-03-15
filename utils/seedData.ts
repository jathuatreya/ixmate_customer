import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // 1. Categories
    const categories = [
      {
        id: "cat_plumbing",
        name: "Plumbing",
        icon: "plumbing",
        color: "#3b82f6",
      },
      {
        id: "cat_cleaning",
        name: "Cleaning",
        icon: "cleaning-services",
        color: "#a855f7",
      },
      {
        id: "cat_painting",
        name: "Painting",
        icon: "format-paint",
        color: "#ec4899",
      },
      {
        id: "cat_masonry",
        name: "Masonry",
        icon: "architecture",
        color: "#14b8a6",
      },
    ];

    categories.forEach((cat) => {
      const ref = doc(db, "categories", cat.id);
      batch.set(ref, cat);
    });

    // 2. Workers
    const workers = [
      {
        id: "worker_1",
        name: "Kamal Gunarathne",
        displayName: "Kamal Gunarathne",
        role: "worker",
        workerRole: "Plumbing",
        serviceCategory: "Plumbing",
        rating: 4.8,
        reviews: 124,
        experience: "10+ Years",
        district: "Colombo",
        city: "Colombo 03",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        isAvailable: true,
        verified: true,
        description:
          "Expert plumber with 10 years of experience in residential repairs.",
      },
      {
        id: "worker_2",
        name: "Sunil Perera",
        displayName: "Sunil Perera",
        role: "worker",
        workerRole: "Cleaning",
        serviceCategory: "Cleaning",
        rating: 4.9,
        reviews: 89,
        experience: "5+ Years",
        district: "Colombo",
        city: "Dehiwala",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        isAvailable: true,
        verified: true,
        description:
          "Professional cleaner specializing in deep cleaning and disinfection.",
      },
      {
        id: "worker_3",
        name: "Nimali Silva",
        displayName: "Nimali Silva",
        role: "worker",
        workerRole: "Painting",
        serviceCategory: "Painting",
        rating: 4.7,
        reviews: 210,
        experience: "8+ Years",
        district: "Colombo",
        city: "Nugegoda",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        isAvailable: true,
        verified: true,
        description:
          "Artistic painter with an eye for detail. Interior and exterior.",
      },
      {
        id: "worker_4",
        name: "Raja Bandara",
        displayName: "Raja Bandara",
        role: "worker",
        workerRole: "Masonry",
        serviceCategory: "Masonry",
        rating: 4.6,
        reviews: 56,
        experience: "12+ Years",
        district: "Colombo",
        city: "Battaramulla",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        isAvailable: true,
        verified: true,
        description:
          "Skilled mason for all construction and renovation projects.",
      },
    ];

    workers.forEach((worker) => {
      const ref = doc(db, "users", worker.id);
      batch.set(ref, worker);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
