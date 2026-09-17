import { all, get, run } from "./db.mjs";

async function insertExhibitIfMissing(zoneId, exhibit) {
  const existingExhibit = await get(
    `
      SELECT exhibit_id
      FROM exhibits
      WHERE zone_id = ? AND name = ?
    `,
    [zoneId, exhibit.name]
  );

  if (!existingExhibit) {
    await run(
      `
        INSERT INTO exhibits (
          zone_id,
          name,
          description,
          exhibit_type,
          image_path,
          display_order
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        zoneId,
        exhibit.name,
        exhibit.description,
        exhibit.exhibitType,
        exhibit.imagePath,
        exhibit.displayOrder
      ]
    );
  }
}

async function setup() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS zones (
        zone_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        image_path TEXT NOT NULL,
        conservation_message TEXT NOT NULL
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS exhibits (
        exhibit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        exhibit_type TEXT NOT NULL,
        image_path TEXT,
        display_order INTEGER NOT NULL,
        FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS event_categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date TEXT NOT NULL,
        image_path TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id)
          REFERENCES event_categories(category_id)
      )
    `);

    const zones = [
      {
        name: "Coral Kingdom",
        slug: "coral-kingdom",
        shortDescription:
          "Explore a vibrant tropical reef filled with colour, biodiversity and fascinating marine life.",
        description:
          "Coral Kingdom introduces visitors to tropical reef ecosystems and the extraordinary relationships between corals, fish and other reef species.",
        imagePath: "/images/zones/coral-kingdom.jpg",
        conservationMessage:
          "Healthy coral reefs support enormous biodiversity, but they are vulnerable to warming seas, pollution and habitat damage.",
        exhibits: [
          {
            name: "Reef Panorama Tank",
            description:
              "A large reef display showing how fish, corals and other species share a complex tropical habitat.",
            exhibitType: "tank",
            imagePath: null,
            displayOrder: 1
          },
          {
            name: "Clownfish Corner",
            description:
              "Discover clownfish and learn about their close relationship with sea anemones.",
            exhibitType: "educational",
            imagePath: null,
            displayOrder: 2
          },
          {
            name: "Coral Nursery",
            description:
              "Explore how aquariums and conservation projects can support coral growth and reef restoration.",
            exhibitType: "interactive",
            imagePath: null,
            displayOrder: 3
          }
        ]
      },
      {
        name: "Into the Deep",
        slug: "into-the-deep",
        shortDescription:
          "Enter the darker depths of the ocean and discover animals adapted to an extreme environment.",
        description:
          "Into the Deep explores low-light ocean habitats where pressure, darkness and limited food have shaped remarkable adaptations.",
        imagePath: "/images/zones/into-the-deep.jpg",
        conservationMessage:
          "Deep-sea ecosystems remain poorly understood, making responsible exploration and protection especially important.",
        exhibits: [
          {
            name: "Twilight Tank",
            description:
              "Meet species adapted to the dim waters between the bright surface ocean and the deep sea.",
            exhibitType: "tank",
            imagePath: null,
            displayOrder: 1
          },
          {
            name: "Bioluminescence Display",
            description:
              "Learn how deep-ocean animals produce or use light for communication, hunting and defence.",
            exhibitType: "educational",
            imagePath: null,
            displayOrder: 2
          },
          {
            name: "Pressure Challenge",
            description:
              "An interactive experience explaining how increasing ocean depth changes pressure and living conditions.",
            exhibitType: "interactive",
            imagePath: null,
            displayOrder: 3
          }
        ]
      },
      {
        name: "Tidal Shores",
        slug: "tidal-shores",
        shortDescription:
          "Discover rockpools, coastal habitats and the changing conditions created by the tides.",
        description:
          "Tidal Shores explores the dynamic boundary between land and sea, where animals and plants must cope with waves, tides and changing exposure.",
        imagePath: "/images/zones/tidal-shores.jpg",
        conservationMessage:
          "Coastal habitats protect wildlife and communities, but they are affected by pollution, disturbance and changing sea levels.",
        exhibits: [
          {
            name: "Rockpool Discovery",
            description:
              "Explore the animals and plants that survive in rockpools as water levels rise and fall.",
            exhibitType: "hands-on",
            imagePath: null,
            displayOrder: 1
          },
          {
            name: "Coastal Habitat Tank",
            description:
              "See species that live around rocky shores and shallow coastal waters.",
            exhibitType: "tank",
            imagePath: null,
            displayOrder: 2
          },
          {
            name: "Tide Table",
            description:
              "An interactive display showing how the movement of the Moon and Earth influences tidal cycles.",
            exhibitType: "interactive",
            imagePath: null,
            displayOrder: 3
          }
        ]
      },
      {
        name: "Rainforest Waters",
        slug: "rainforest-waters",
        shortDescription:
          "Journey into tropical freshwater habitats inspired by rivers and seasonally flooded forests.",
        description:
          "Rainforest Waters focuses on freshwater ecosystems where rivers, forests and seasonal flooding create habitats for diverse aquatic life.",
        imagePath: "/images/zones/rainforest-waters.jpg",
        conservationMessage:
          "Freshwater biodiversity depends on healthy rivers and forests, making habitat protection and responsible water use essential.",
        exhibits: [
          {
            name: "Amazon River Tank",
            description:
              "Discover freshwater fish associated with the vast river systems of tropical South America.",
            exhibitType: "tank",
            imagePath: null,
            displayOrder: 1
          },
          {
            name: "Flooded Forest",
            description:
              "Learn how seasonal flooding transforms rainforest habitats and creates feeding and breeding opportunities.",
            exhibitType: "educational",
            imagePath: null,
            displayOrder: 2
          },
          {
            name: "Water Cycle Discovery",
            description:
              "An interactive experience connecting rainfall, rivers, forests and freshwater ecosystems.",
            exhibitType: "interactive",
            imagePath: null,
            displayOrder: 3
          }
        ]
      }
    ];

    for (const zone of zones) {
      await run(
        `
          INSERT OR IGNORE INTO zones (
            name,
            slug,
            short_description,
            description,
            image_path,
            conservation_message
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          zone.name,
          zone.slug,
          zone.shortDescription,
          zone.description,
          zone.imagePath,
          zone.conservationMessage
        ]
      );

      const savedZone = await get(
        "SELECT zone_id FROM zones WHERE slug = ?",
        [zone.slug]
      );

      for (const exhibit of zone.exhibits) {
        await insertExhibitIfMissing(savedZone.zone_id, exhibit);
      }
    }

    const categories = [
      {
        name: "Family Activities",
        slug: "family-activities"
      },
      {
        name: "Conservation & Learning",
        slug: "conservation-learning"
      },
      {
        name: "Special Experiences",
        slug: "special-experiences"
      }
    ];

    for (const category of categories) {
      await run(
        `
          INSERT OR IGNORE INTO event_categories (name, slug)
          VALUES (?, ?)
        `,
        [category.name, category.slug]
      );
    }

    const categoryRows = await all(
      "SELECT category_id, slug FROM event_categories"
    );

    const categoryIds = Object.fromEntries(
      categoryRows.map((category) => [
        category.slug,
        category.category_id
      ])
    );

    const events = [
      {
        categorySlug: "family-activities",
        name: "Ocean Discovery Day",
        slug: "ocean-discovery-day-2026",
        shortDescription:
          "A family day of marine discovery activities and aquarium learning.",
        description:
          "Ocean Discovery Day invites families to explore marine habitats through guided activities, demonstrations and educational challenges around the aquarium.",
        eventDate: "2026-04-18",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "conservation-learning",
        name: "Coral Conservation Workshop",
        slug: "coral-conservation-workshop-2026",
        shortDescription:
          "Learn why coral reefs matter and how restoration projects support their future.",
        description:
          "This workshop introduces the pressures facing coral reefs and explores practical conservation and restoration approaches through demonstrations and discussion.",
        eventDate: "2026-06-13",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "special-experiences",
        name: "After Dark: Deep Ocean",
        slug: "after-dark-deep-ocean-2026",
        shortDescription:
          "Experience the mysterious world of deep-ocean animals in an evening programme.",
        description:
          "After Dark: Deep Ocean focuses on low-light habitats, bioluminescence and the unusual adaptations that allow animals to survive far below the surface.",
        eventDate: "2026-10-17",
        imagePath: null,
        featured: 1
      },
      {
        categorySlug: "family-activities",
        name: "Rockpool Explorer Day",
        slug: "rockpool-explorer-day-2026",
        shortDescription:
          "A family-focused exploration of rockpools, tides and coastal wildlife.",
        description:
          "Visitors can investigate how coastal species survive changing tides and learn how everyday actions can help protect shoreline habitats.",
        eventDate: "2026-08-22",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "conservation-learning",
        name: "Freshwater Futures Talk",
        slug: "freshwater-futures-talk-2026",
        shortDescription:
          "Explore why rivers and freshwater habitats are important for biodiversity.",
        description:
          "Freshwater Futures examines the connections between healthy rivers, forests, wildlife and communities, with practical examples of freshwater conservation.",
        eventDate: "2026-11-14",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "family-activities",
        name: "Junior Reef Explorers",
        slug: "junior-reef-explorers-2025",
        shortDescription:
          "A family activity introducing young visitors to coral reef biodiversity.",
        description:
          "Junior Reef Explorers used observation activities and simple challenges to help younger visitors recognise the variety of life supported by coral reefs.",
        eventDate: "2025-05-24",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "conservation-learning",
        name: "Ocean Plastics Workshop",
        slug: "ocean-plastics-workshop-2025",
        shortDescription:
          "A practical learning session about plastic pollution and marine ecosystems.",
        description:
          "The workshop explored how plastic reaches the ocean, how it affects marine environments and what individuals and communities can do to reduce its impact.",
        eventDate: "2025-07-12",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "special-experiences",
        name: "Twilight Aquarium Evening",
        slug: "twilight-aquarium-evening-2025",
        shortDescription:
          "An evening experience exploring how aquatic life changes as light levels fall.",
        description:
          "Twilight Aquarium Evening introduced visitors to nocturnal behaviour, low-light habitats and adaptations associated with life after sunset.",
        eventDate: "2025-09-20",
        imagePath: null,
        featured: 0
      },
      {
        categorySlug: "conservation-learning",
        name: "Coastal Habitats Talk",
        slug: "coastal-habitats-talk-2025",
        shortDescription:
          "A learning session exploring coastal ecosystems and the challenges they face.",
        description:
          "The talk examined rocky shores, tidal habitats and the importance of reducing pollution and disturbance around sensitive coastal environments.",
        eventDate: "2025-11-08",
        imagePath: null,
        featured: 0
      }
    ];

    for (const event of events) {
      await run(
        `
          INSERT OR IGNORE INTO events (
            category_id,
            name,
            slug,
            short_description,
            description,
            event_date,
            image_path,
            featured
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          categoryIds[event.categorySlug],
          event.name,
          event.slug,
          event.shortDescription,
          event.description,
          event.eventDate,
          event.imagePath,
          event.featured
        ]
      );
    }

    const zoneCount = await get(
      "SELECT COUNT(*) AS count FROM zones"
    );

    const exhibitCount = await get(
      "SELECT COUNT(*) AS count FROM exhibits"
    );

    const categoryCount = await get(
      "SELECT COUNT(*) AS count FROM event_categories"
    );

    const eventCount = await get(
      "SELECT COUNT(*) AS count FROM events"
    );

    const messageCount = await get(
      "SELECT COUNT(*) AS count FROM messages"
    );

    console.log("Database setup complete.");
    console.log(`Zones: ${zoneCount.count}`);
    console.log(`Exhibits: ${exhibitCount.count}`);
    console.log(`Event categories: ${categoryCount.count}`);
    console.log(`Events: ${eventCount.count}`);
    console.log(`Messages: ${messageCount.count}`);
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  }
}

setup();