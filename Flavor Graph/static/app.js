const ingredientInput = document.getElementById('ingredient-input');
const addBtn = document.getElementById('add-btn');
const chips = document.getElementById('ingredient-chips');
const suggestBtn = document.getElementById('suggest-btn');
const resetBtn = document.getElementById('reset-btn');
const suggestionsEl = document.getElementById('suggestions');
const yearEl = document.getElementById('year');
const heroInput = document.getElementById('hero-input');
const heroSearch = document.getElementById('hero-search');
const featuredList = document.getElementById('featured-list');

yearEl.textContent = new Date().getFullYear();

let ingredients = [];
let combinedRecipes = [];
let pageSize = 6;
let currentPage = 0;
let sentinel = null;
const compactToggle = document.getElementById('compact-toggle');

function renderChips() {
  chips.innerHTML = '';
  ingredients.forEach((ing, idx) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    // use a visible close glyph and data index for removal
    chip.innerHTML = `<span>${ing}</span><span class="remove" data-idx="${idx}">\u2715</span>`;
    chips.appendChild(chip);
    // show animation
    requestAnimationFrame(() => chip.classList.add('show'));
  });
}

function addIngredient() {
  const raw = ingredientInput.value.trim();
  if (!raw) return;
  // Support comma-separated input (e.g. "a, b, c")
  const parts = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const val of parts) {
    if (!ingredients.includes(val)) ingredients.push(val);
  }
  ingredientInput.value = '';
  renderChips();
}

chips.addEventListener('click', (e) => {
  const idx = e.target.getAttribute('data-idx');
  if (idx !== null) {
    // animate removal
    const chipEl = e.target.closest('.chip');
    if (chipEl) {
      chipEl.style.transition = 'opacity .18s ease, transform .18s ease';
      chipEl.style.opacity = '0';
      chipEl.style.transform = 'scale(.92) translateX(6px)';
      setTimeout(() => {
        ingredients.splice(Number(idx), 1);
        renderChips();
      }, 180);
    } else {
      ingredients.splice(Number(idx), 1);
      renderChips();
    }
  }
});

addBtn.addEventListener('click', addIngredient);
ingredientInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addIngredient();
});

resetBtn.addEventListener('click', () => {
  ingredients = [];
  renderChips();
  suggestionsEl.innerHTML = '';
});

function getNumber(id, min, max, fallback) {
  const v = Number(document.getElementById(id).value);
  if (Number.isFinite(v)) return Math.max(min, Math.min(max, v));
  return fallback;
}

async function suggest() {
  // If user has typed ingredients but not clicked Add, include them
  if (ingredientInput.value.trim()) addIngredient();

  if (!ingredients.length) {
    suggestionsEl.innerHTML = '<div class="pill">Add at least one ingredient to see recipes.</div>';
    return;
  }

  suggestionsEl.innerHTML = '<div class="pill loading">Loading recipes</div>';

  try {
    // 1) fetch all recipes
    const rRes = await fetch('/api/recipes');
    if (!rRes.ok) throw new Error('Failed to fetch recipes');
    const rJson = await rRes.json();
    const recipes = rJson.recipes || [];

    // 2) ask the server to analyze gaps for all recipes in one call
    const recipeIds = recipes.map(r => r.id);
    const aRes = await fetch('/api/analyze_gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_ids: recipeIds, available_ingredients: ingredients }),
    });
    if (!aRes.ok) {
      const txt = await aRes.text();
      throw new Error(`Analyze failed: ${txt}`);
    }
    const aJson = await aRes.json();
    const gaps = aJson.gaps || {};

    // Combine recipe data with analysis and sort by missing count (ascending)
    const combined = recipes.map(r => {
      const info = gaps[r.id] || { missing: [], covered: [], substitution_candidates: {} };
      return { ...r, missing: info.missing || [], covered: info.covered || [], substitutions: info.substitution_candidates || {} };
    });

    combined.sort((a, b) => (a.missing.length - b.missing.length) || (a.title || '').localeCompare(b.title || ''));

      combinedRecipes = combined;
      currentPage = 0;
      // remove any existing sentinel
      if (sentinel && sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
      renderPage();
  } catch (e) {
    suggestionsEl.innerHTML = `<div class="pill">Error: ${e.message}</div>`;
  }
}

function renderSuggestions(list) {
  if (!list.length) {
    suggestionsEl.innerHTML = '<div class="pill">No suggestions. Try adding more ingredients or loosening constraints.</div>';
    return;
  }
  suggestionsEl.innerHTML = '';
  for (const s of list) {
    const card = document.createElement('div');
    card.className = 'card card-enter';
    const missing = s.missing || [];
    const covered = s.covered || [];
    const subs = s.substitutions || {};
    const subsLines = Object.entries(subs).map(([need, use]) => `${need} → ${use}`);
    card.innerHTML = `
      <h3>${s.title}</h3>
      <div class="meta">
        ${(s.tags || []).slice(0,4).map(t => `<span class="pill">${t}</span>`).join('')}
      </div>
      <div class="meta">
        <span class="pill covered">Covered: ${covered.length}</span>
        <span class="pill missing">Missing: ${missing.length}</span>
        <span class="pill subs">Subs: ${subsLines.length}</span>
      </div>
      <details>
        <summary>Ingredients</summary>
        <ul>${(s.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
      </details>
      <details>
        <summary>Instructions</summary>
        <ol>${(s.instructions||[]).map(i=>`<li>${i}</li>`).join('')}</ol>
      </details>
      ${missing.length ? `<details open><summary>Missing</summary><ul>${missing.map(m=>`<li class="missing">${m}</li>`).join('')}</ul></details>` : ''}
      ${subsLines.length ? `<details open><summary>Substitutions</summary><ul>${subsLines.map(m=>`<li class="subs">${m}</li>`).join('')}</ul></details>` : ''}
    `;
    suggestionsEl.appendChild(card);
    // staggered reveal
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.remove('card-enter'), 60);
    });
  }
}

function renderAllRecipes(list) {
  if (!list.length) {
    suggestionsEl.innerHTML = '<div class="pill">No recipes available.</div>';
    return;
  }

  suggestionsEl.innerHTML = '';
  for (const s of list) {
    const card = document.createElement('div');
    const missing = s.missing || [];
    const covered = s.covered || [];
    const subs = s.substitutions || {};

    card.className = 'card recipe-card';
    if (missing.length === 0) card.classList.add('makeable'); else card.classList.add('needs');

    const subsLines = Object.entries(subs).map(([need, use]) => `${need} → ${use}`);

    card.innerHTML = `
      <div class="card-header">
        <h3>${s.title || ''}</h3>
        <div class="badge">${missing.length === 0 ? 'Makeable' : `${missing.length} missing`}</div>
      </div>
      <div class="meta small">
        ${(s.tags || []).slice(0,4).map(t => `<span class="pill">${t}</span>`).join('')}
      </div>
      <div class="details">
        <div class="status">
          ${missing.length ? `<strong>Missing:</strong> ${missing.join(', ')}` : `<strong>Covered:</strong> All Ingredients`}
        </div>
        ${subsLines.length ? `<div class="status"><strong>Substitutes:</strong> ${subsLines.join(', ')}</div>` : ''}
        <details open>
          <summary>Ingredients</summary>
          <ul>${(s.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
        </details>
        <details open>
          <summary>Steps</summary>
          <ol>${(s.instructions||[]).map(i=>`<li>${i}</li>`).join('')}</ol>
        </details>
      </div>
    `;

    suggestionsEl.appendChild(card);
    requestAnimationFrame(() => setTimeout(() => card.classList.add('reveal'), 40));
  }
}

// --- Pagination / infinite scroll helpers ---
function renderPage() {
  suggestionsEl.innerHTML = '';
  const start = currentPage * pageSize;
  const pageItems = combinedRecipes.slice(start, start + pageSize);
  for (const s of pageItems) appendRecipeCard(s);

  // if more pages remain, add sentinel
  if ((start + pageSize) < combinedRecipes.length) {
    sentinel = document.createElement('div');
    sentinel.className = 'sentinel';
    suggestionsEl.appendChild(sentinel);
    observeSentinel();
  }
}

function appendRecipeCard(s) {
  const card = document.createElement('div');
  const missing = s.missing || [];
  const covered = s.covered || [];
  const subs = s.substitutions || {};
  card.className = 'card recipe-card';
  if (missing.length === 0) card.classList.add('makeable'); else card.classList.add('needs');
  const subsLines = Object.entries(subs).map(([need, use]) => `${need} → ${use}`);

  // No thumbnail images per user request — omit image elements entirely

  card.innerHTML = `
    <div>
      <div class="card-header">
        <h3>${s.title || ''}</h3>
        <div class="badge">${missing.length === 0 ? 'Makeable' : `${missing.length} missing`}</div>
      </div>
      <div class="meta small">
        ${(s.tags || []).slice(0,4).map(t => `<span class="pill">${t}</span>`).join('')}
      </div>
      <div class="details">
        <div class="status">
          ${missing.length ? `<strong>Missing:</strong> ${missing.join(', ')}` : `<strong>Covered:</strong> All Ingredients`}
        </div>
        ${subsLines.length ? `<div class="status"><strong>Substitutes:</strong> ${subsLines.join(', ')}</div>` : ''}
        <details>
          <summary>Ingredients</summary>
          <ul>${(s.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
        </details>
        <details>
          <summary>Steps</summary>
          <ol>${(s.instructions||[]).map(i=>`<li>${i}</li>`).join('')}</ol>
        </details>
        <div class="card-actions">
          <button class="btn copy" data-id="${s.id}">Copy</button>
          <button class="btn share" data-id="${s.id}">Share</button>
        </div>
      </div>
    </div>
  `;
  suggestionsEl.appendChild(card);
  // attach handlers
  const copyBtn = card.querySelector('.btn.copy');
  const shareBtn = card.querySelector('.btn.share');
  if (copyBtn) copyBtn.addEventListener('click', () => copyRecipe(s));
  if (shareBtn) shareBtn.addEventListener('click', () => shareRecipe(s));
  requestAnimationFrame(() => setTimeout(() => card.classList.add('reveal'), 40));
}

function observeSentinel() {
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        obs.disconnect();
        currentPage += 1;
        renderPage();
      }
    }
  }, { rootMargin: '120px' });
  obs.observe(sentinel);
}

// --- Copy / Share ---
async function copyRecipe(recipe) {
  const text = `${recipe.title}\n\nIngredients:\n- ${(recipe.ingredients||[]).join('\n- ')}\n\nSteps:\n- ${(recipe.instructions||[]).join('\n- ')}`;
  try {
    await navigator.clipboard.writeText(text);
    alert('Recipe copied to clipboard');
  } catch (e) {
    alert('Copy failed');
  }
}

async function shareRecipe(recipe) {
  const text = `${recipe.title}\n\nIngredients:\n- ${(recipe.ingredients||[]).join('\n- ')}\n\nSteps:\n- ${(recipe.instructions||[]).join('\n- ')}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: recipe.title, text });
    } catch (e) {
      alert('Share cancelled');
    }
  } else {
    // fallback: copy to clipboard
    copyRecipe(recipe);
  }
}

// compact toggle
if (compactToggle) {
  compactToggle.addEventListener('change', (e) => {
    if (e.target.checked) document.body.classList.add('compact'); else document.body.classList.remove('compact');
  });
}

suggestBtn.addEventListener('click', suggest);

// hero search triggers suggest flow
if (heroSearch) heroSearch.addEventListener('click', () => {
  if (heroInput && heroInput.value.trim()) {
    ingredientInput.value = heroInput.value.trim();
    addIngredient();
  }
  suggest();
});

// fetch a few featured recipes on load
async function loadFeatured() {
  try {
    const res = await fetch('/api/recipes');
    if (!res.ok) return;
    const json = await res.json();
    const items = (json.recipes || []).slice(0,4);
    featuredList.innerHTML = '';
    for (const it of items) {
      const el = document.createElement('div');
      el.className = 'featured-item';
      const info = document.createElement('div');
      info.innerHTML = `<div class="title">${it.title}</div><div class="meta">${(it.tags||[]).join(', ')}</div>`;
      el.appendChild(info);
      el.addEventListener('click', () => {
        // when clicking a featured recipe, add its ingredients and suggest
        ingredientInput.value = (it.ingredients||[]).join(', ');
        addIngredient();
        suggest();
      });
      featuredList.appendChild(el);
    }
  } catch (e) {
    // ignore
  }
}

loadFeatured();


