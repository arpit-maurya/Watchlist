function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  menu.classList.toggle("open");
}


// Close mobile menu when clicking outside it
document.addEventListener("click", function (event) {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu");

  if (
    menu.classList.contains("open") &&
    !menu.contains(event.target) &&
    event.target !== button
  ) {
    menu.classList.remove("open");
  }

});