const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const messageError = document.getElementById("message-error");

    let isValid = true;

    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";

    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    const messageValue = message.value.trim();

    if (nameValue.length < 2 || nameValue.length > 100) {
      nameError.textContent =
        "Please enter a name between 2 and 100 characters.";
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      emailValue.length > 254 ||
      !emailPattern.test(emailValue)
    ) {
      emailError.textContent =
        "Please enter a valid email address.";
      isValid = false;
    }

    if (
      messageValue.length < 10 ||
      messageValue.length > 1000
    ) {
      messageError.textContent =
        "Please enter a message between 10 and 1000 characters.";
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  });
}