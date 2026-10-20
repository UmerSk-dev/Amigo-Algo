"use strict";

// Add gentle page-entry and scroll-reveal motion without blocking content if unsupported.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.body.classList.add("page-enter");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".intro-grid, .feature-section, .section-head, .feature-card, .agenda, .faq, .bottom-cta, .explore-panel, .api-note, .form-card, .register-layout",
  );

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    if (element.classList.contains("feature-card")) {
      element.style.transitionDelay = `${(index % 3) * 70}ms`;
    }
    revealObserver.observe(element);
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const searchForm = document.querySelector("#repo-search");

if (searchForm) {
  const queryInput = document.querySelector("#search-query");
  const languageFilter = document.querySelector("#language-filter");
  const sortFilter = document.querySelector("#sort-filter");
  const status = document.querySelector("#api-status");
  const results = document.querySelector("#repo-results");
  const moreButton = document.querySelector("#load-more");

  let page = 1;
  let loading = false;

  function escapeHtml(value = "") {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return String(value).replace(/[&<>"']/g, (character) => replacements[character]);
  }

  function createRepositoryCard(repository) {
    const description =
      repository.description ||
      "No description yet — perhaps this is your next rabbit hole.";
    const updatedDate = repository.updated_at
      ? new Date(repository.updated_at).toLocaleDateString()
      : "Date unavailable";

    return `
      <article class="repo-card">
        <h3>
          <a href="${escapeHtml(repository.html_url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(repository.full_name)}
          </a>
        </h3>
        <p>${escapeHtml(description)}</p>
        <div class="repo-meta">
          <span>★ ${Number(repository.stargazers_count || 0).toLocaleString()}</span>
          <span>⑂ ${Number(repository.forks_count || 0).toLocaleString()}</span>
          <span class="repo-language">${escapeHtml(repository.language || "Mixed / unspecified")}</span>
        </div>
        <div class="repo-owner">UPDATED ${escapeHtml(updatedDate)}</div>
      </article>
    `;
  }

  async function searchRepositories({ append = false } = {}) {
    if (loading) return;

    const query = queryInput.value.trim();

    if (!query) {
      status.className = "api-status error";
      status.textContent = "Add a search term to discover projects.";
      queryInput.focus();
      return;
    }

    if (!append) {
      page = 1;
      results.replaceChildren();
    }

    loading = true;
    moreButton.classList.add("hidden");
    status.className = "api-status";
    status.textContent = "Looking for interesting projects…";

    const language = languageFilter.value;
    const sortValue = sortFilter.value;
    const searchQuery = `${query}${language ? ` language:${language}` : ""}`;
    const sort = ["updated", "forks"].includes(sortValue) ? sortValue : "stars";
    const url = new URL("https://api.github.com/search/repositories");

    url.search = new URLSearchParams({
      q: searchQuery,
      sort,
      order: "desc",
      per_page: "8",
      page: String(page),
    });

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error(
            "GitHub's public API is rate-limiting requests. Wait a moment and try again.",
          );
        }

        throw new Error(`GitHub returned an error (${response.status}). Please try again.`);
      }

      const data = await response.json();
      const repositories = Array.isArray(data.items) ? data.items : [];

      if (repositories.length === 0 && !append) {
        status.textContent = "No projects found. Try a broader search term.";
        return;
      }

      results.insertAdjacentHTML(
        "beforeend",
        repositories.map(createRepositoryCard).join(""),
      );
      if (!prefersReducedMotion) {
        Array.from(results.children).slice(append ? -repositories.length : 0).forEach((card, index) => {
          card.animate(
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 360, delay: Math.min(index * 45, 270), easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        });
      }

      const totalCount = Number(data.total_count || 0);
      status.textContent = `${totalCount.toLocaleString()} projects found · showing ${results.children.length}`;

      if (results.children.length < totalCount && repositories.length > 0) {
        moreButton.classList.remove("hidden");
      }
    } catch (error) {
      status.className = "api-status error";
      status.textContent = `${error.message || "Something went wrong."} Check your connection and retry.`;

      if (!append) results.replaceChildren();
    } finally {
      loading = false;
    }
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    page = 1;
    searchRepositories();
  });

  languageFilter.addEventListener("change", () => {
    page = 1;
    searchRepositories();
  });

  sortFilter.addEventListener("change", () => {
    page = 1;
    searchRepositories();
  });

  moreButton.addEventListener("click", () => {
    page += 1;
    searchRepositories({ append: true });
  });

  searchRepositories();
}

const rsvpForm = document.querySelector("#rsvp-form");

if (rsvpForm) {
  const status = document.querySelector("#rsvp-status");
  const submitButton = rsvpForm.querySelector('button[type="submit"]');

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!rsvpForm.reportValidity()) return;

    status.className = "form-status";
    status.textContent = "Saving your spot…";
    submitButton.disabled = true;

    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not save your registration.");
      }

      status.textContent = data.message || "You're on the list!";
      rsvpForm.reset();
    } catch (error) {
      status.className = "form-status error";
      status.textContent =
        window.location.protocol === "file:"
          ? "Start the Node server (see README) to save registrations."
          : error.message || "Could not connect to the server. Please try again.";
    } finally {
      submitButton.disabled = false;
    }
  });
}
