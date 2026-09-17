const creatureData = {
  anglerfish: {
    name: "Anglerfish",
    fact: "Female anglerfish use a glowing lure to attract prey in the darkness of the deep ocean."
  },

  "giant-isopod": {
    name: "Giant Isopod",
    fact: "Giant isopods are deep-sea relatives of woodlice and can survive long periods between meals."
  },

  "vampire-squid": {
    name: "Vampire Squid",
    fact: "Despite its dramatic name, the vampire squid mainly feeds on drifting organic material called marine snow."
  },

  barreleye: {
    name: "Barreleye Fish",
    fact: "Barreleye fish have transparent heads and upward-facing eyes that help them detect silhouettes above."
  },

  "gulper-eel": {
    name: "Gulper Eel",
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

    feedbackElement.innerHTML = "";

    const name = document.createElement("h3");
    name.textContent = creature.name;

    const fact = document.createElement("p");
    fact.textContent = creature.fact;

    if (alreadyDiscovered) {
      const reminder = document.createElement("p");
      reminder.className = "activity-feedback__note";
      reminder.textContent = "You have already discovered this creature.";

      feedbackElement.append(name, fact, reminder);
    } else {
      feedbackElement.append(name, fact);
    }

    updateProgress();
  }

  creatureSpots.forEach((button) => {
    button.addEventListener("click", () => {
      revealCreature(button);
    });
  });

  updateProgress();
}