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
        id: "cat_electrical",
        name: "Electrical",
        icon: "electrical-services",
        color: "#eab308",
      },
      {
        id: "cat_cleaning",
        name: "Cleaning",
        icon: "cleaning-services",
        color: "#10b981",
      },
      {
        id: "cat_painting",
        name: "Painting",
        icon: "format-paint",
        color: "#f97316",
      },
      { id: "cat_hvac", name: "AC Repair", icon: "ac-unit", color: "#06b6d4" },
      {
        id: "cat_moving",
        name: "Moving",
        icon: "local-shipping",
        color: "#8b5cf6",
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
        category: "Plumbing",
        categoryId: "cat_plumbing",
        rating: 4.8,
        reviews: 124,
        hourlyRate: 1500,
        location: "Colombo 03",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        isAvailable: true,
        description:
          "Expert plumber with 10 years of experience in residential repairs.",
      },
      {
        id: "worker_2",
        name: "Sunil Perera",
        category: "Electrical",
        categoryId: "cat_electrical",
        rating: 4.9,
        reviews: 89,
        hourlyRate: 2000,
        location: "Dehiwala",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        isAvailable: true,
        description:
          "Certified electrician for all your wiring and installation needs.",
      },
      {
        id: "worker_3",
        name: "Nimali Silva",
        category: "Cleaning",
        categoryId: "cat_cleaning",
        rating: 4.7,
        reviews: 210,
        hourlyRate: 1000,
        location: "Nugegoda",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        isAvailable: true,
        description:
          "Standard and deep cleaning services for homes and offices.",
      },
      {
        id: "worker_4",
        name: "Raja Bandara",
        category: "Painting",
        categoryId: "cat_painting",
        rating: 4.6,
        reviews: 56,
        hourlyRate: 1800,
        location: "Battaramulla",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        isAvailable: false,
        description:
          "Professional wall painter. Interior and exterior painting.",
      },
    ];

    workers.forEach((worker) => {
      const ref = doc(db, "workers", worker.id);
      batch.set(ref, worker);
    });

    // 3. Requests (Dummy past requests for the logged in user context usually, but here generic)
    // We won't batch these as they might depend on user IDs, but for now we can add some 'sample' requests
    // assigned to a placeholder user if needed, or just skip.
    // Let's assume we want to view them in "My Requests", so we might need a test user ID.
    // We'll skip requests for now or add them dynamically when a user signs up/makes a request.

    await batch.commit();
    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
