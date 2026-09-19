const creatureData = {
  anglerfish: {
    name: "Anglerfish",
    image: "/images/creatures/anglerfish.webp",
    alt: "Anglerfish with a glowing lure in the dark deep ocean",
    fact: "Female anglerfish use a glowing lure to attract prey in the darkness of the deep ocean."
  },

  "giant-isopod": {
    name: "Giant Isopod",
    image: "/images/creatures/giant-isopod.webp",
    alt: "Giant isopod resting on the deep-sea floor",
    fact: "Giant isopods are deep-sea relatives of woodlice and can survive long periods between meals."
  },

  "vampire-squid": {
    name: "Vampire Squid",
    image: "/images/creatures/vampire-squid.webp",
    alt: "Vampire squid swimming in dark deep-ocean water",
    fact: "Despite its dramatic name, the vampire squid mainly feeds on drifting organic material called marine snow."
  },

  barreleye: {
    name: "Barreleye Fish",
    image: "/images/creatures/barreleye-fish.webp",
    alt: "Barreleye fish with a transparent head in the deep ocean",
    fact: "Barreleye fish have transparent heads and upward-facing eyes that help them detect silhouettes above."
  },

  "gulper-eel": {
    name: "Gulper Eel",
    image: "/images/creatures/gulper-eel.webp",
     alt: "Gulper eel swimming with its long curved body in the deep ocean",
    fact: "The gulper eel has an unusually large mouth that helps it capture food in an environment where meals are scarce."
  }
};

const creatureSpots = document.querySelectorAll(".creature-spot");
const progressElement = document.getElementById("activity-progress");
const feedbackElement = document.getElementById("activity-feedback");
const completionElement = document.getElementById("activity-complete");

if (
  creatureSpots.length > 0 &&
  progressElement &&
  feedbackElement &&
  completionElement
) {
  const discoveredCreatures = new Set();
  const totalCreatures = creatureSpots.length;

  function updateProgress() {
    const discoveredCount = discoveredCreatures.size;

    progressElement.textContent =
      `${discoveredCount} of ${totalCreatures} creatures discovered`;

    if (discoveredCount === totalCreatures) {
      completionElement.hidden = false;
    }
  }

  function revealCreature(button) {
    const creatureKey = button.dataset.creature;
    const creature = creatureData[creatureKey];

    if (!creature) {
      return;
    }

    const alreadyDiscovered = discoveredCreatures.has(creatureKey);

    if (!alreadyDiscovered) {
      discoveredCreatures.add(creatureKey);

      button.classList.add("creature-spot--discovered");
      button.setAttribute("aria-label", `${creature.name} discovered`);
      button.querySelector("span").textContent = "✓";
    }

    feedbackElement.replaceChildren();

    const layout = document.createElement("div");
    layout.classList.add("activity-feedback__content");

    const image = document.createElement("img");
    image.classList.add("activity-feedback__image");
    image.src = creature.image;
    image.alt = creature.alt;

    const information = document.createElement("div");
    information.classList.add("activity-feedback__information");

    const name = document.createElement("h3");
    name.textContent = creature.name;

    const fact = document.createElement("p");
    fact.textContent = creature.fact;

    information.append(name, fact);

    if (alreadyDiscovered) {
      const reminder = document.createElement("p");
      reminder.className = "activity-feedback__note";
      reminder.textContent = "You have already discovered this creature.";

      information.append(reminder);
    }

    layout.append(image, information);
    feedbackElement.append(layout);

    updateProgress();
  }

  creatureSpots.forEach((button) => {
    button.addEventListener("click", () => {
      revealCreature(button);
    });
  });

  updateProgress();
}