import express from "express";
import { run } from "../database/db.mjs";

const router = express.Router();

function validateContactForm(name, email, message) {
  const errors = [];

  if (!name || name.length < 2 || name.length > 100) {
    errors.push("Please enter a name between 2 and 100 characters.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!message || message.length < 10 || message.length > 1000) {
    errors.push("Please enter a message between 10 and 1000 characters.");
  }

  return errors;
}

router.get("/", (req, res) => {
  res.render("contact", {
    errors: [],
    submitted: false,
    formData: {
      name: "",
      email: "",
      message: ""
    }
  });
});

router.post("/", async (req, res) => {
  const formData = {
    name: req.body.name?.trim() || "",
    email: req.body.email?.trim() || "",
    message: req.body.message?.trim() || ""
  };

  const errors = validateContactForm(
    formData.name,
    formData.email,
    formData.message
  );

  if (errors.length > 0) {
    return res.status(400).render("contact", {
      errors,
      submitted: false,
      formData
    });
  }

  try {
    await run(
      `
        INSERT INTO messages (
          name,
          email,
          message
        )
        VALUES (?, ?, ?)
      `,
      [
        formData.name,
        formData.email,
        formData.message
      ]
    );

    res.render("contact", {
      errors: [],
      submitted: true,
      formData: {
        name: "",
        email: "",
        message: ""
      }
    });
  } catch (error) {
    console.error("Error saving contact message:", error.message);

    res.status(500).render("contact", {
      errors: [
        "Your message could not be sent. Please try again."
      ],
      submitted: false,
      formData
    });
  }
});

export default router;