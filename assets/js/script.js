document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  // === Element Toggle ===
  const elementToggleFunc = elem => elem.classList.toggle("active");

  // === Sidebar Toggle ===
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");
  if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
  }

  // === Testimonials Modal ===
  const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  const testimonialsModalFunc = () => {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  testimonialsItem.forEach(item => {
    item.addEventListener("click", () => {
      modalImg.src = item.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = item.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = item.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = item.querySelector("[data-testimonials-text]").innerHTML;
      testimonialsModalFunc();
    });
  });

  modalCloseBtn?.addEventListener("click", testimonialsModalFunc);
  overlay?.addEventListener("click", testimonialsModalFunc);

  // === Custom Select & Filter ===
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const filterItems = document.querySelectorAll("[data-filter-item]");

  if (select) {
    select.addEventListener("click", () => elementToggleFunc(select));
  }

  const filterFunc = selectedValue => {
    filterItems.forEach(item => {
      item.classList.toggle("active", selectedValue === "all" || selectedValue === item.dataset.category);
    });
  };

  selectItems.forEach(item => {
    item.addEventListener("click", () => {
      const selectedValue = item.innerText.toLowerCase();
      selectValue.innerText = item.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  let lastClickedBtn = filterBtn[0];
  filterBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedValue = btn.innerText.toLowerCase();
      selectValue.innerText = btn.innerText;
      filterFunc(selectedValue);
      lastClickedBtn.classList.remove("active");
      btn.classList.add("active");
      lastClickedBtn = btn;
    });
  });

  // === Contact Form ===
  const form = document.querySelector("#contact-form");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  if (form) {
    formInputs.forEach(input => {
      input.addEventListener("input", () => {
        if (form.checkValidity()) {
          formBtn.removeAttribute("disabled");
        } else {
          formBtn.setAttribute("disabled", "");
        }
      });
    });

    form.addEventListener("submit", async e => {
      e.preventDefault();

      const name = form.querySelector('[name="fullname"]').value;
      const email = form.querySelector('[name="email"]').value;
      const message = form.querySelector('[name="message"]').value;

      try {
        const res = await fetch('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        const result = await res.text();
        alert(result);
        form.reset();
        formBtn.setAttribute("disabled", "");
      } catch (err) {
        alert("Failed to send message: " + err.message);
      }
    });
  }

  // === Page Navigation ===
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  navigationLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      pages.forEach((page, i) => {
        const isActive = link.innerHTML.toLowerCase() === page.dataset.page;
        page.classList.toggle("active", isActive);
        navigationLinks[i].classList.toggle("active", isActive);
      });
      window.scrollTo(0, 0);
    });
  });

  // === Visitor Counter ===
  fetch('http://localhost:3000/api/views')
    .then(res => res.json())
    .then(data => {
      const viewEl = document.getElementById("view-counter");
      if (viewEl) viewEl.textContent = data.views;
    });
});
