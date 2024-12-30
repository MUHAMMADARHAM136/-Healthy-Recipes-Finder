document.getElementById('search-button').addEventListener('click', searchRecipes);

async function searchRecipes() {
    const ingredients = document.getElementById('ingredient-input').value.toLowerCase().split(',').map(i => i.trim());
    const diet = document.getElementById('diet-select').value;
    const mealType = document.getElementById('meal-type-select').value;

    const recipes = await fetch('./recipes.json').then(res => res.json());

    const filteredRecipes = recipes.filter(recipe => {
        return (
            (!diet || recipe.diet === diet) &&
            (!mealType || recipe.mealType === mealType) &&
            ingredients.every(ingredient => recipe.ingredients.includes(ingredient))
        );
    });

    displayRecipes(filteredRecipes);
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipes-container');
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <h3>${recipe.name}</h3>
            <p>Calories: ${recipe.calories}</p>
            <p>${recipe.ingredients.join(', ')}</p>
            <label for="portion-input">Portion:</label>
            <input type="number" value="1" min="1" id="portion-input-${recipe.id}" onchange="updateCalories(${recipe.id}, ${recipe.calories})">
        </div>
    `).join('');
}


function updateCalories(recipeId, baseCalories) {
    const input = document.getElementById(`portion-input-${recipeId}`);
    const portion = parseInt(input.value, 10);
    const updatedCalories = baseCalories * portion;
    alert(`Updated Calories: ${updatedCalories}`);
}
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    document.getElementById('export-button').addEventListener('click', exportMealPlan);
});

function setupDragAndDrop() {
    const recipeCards = document.getElementsByClassName('recipe-card');
    const dayColumns = document.getElementsByClassName('day-column');

    for (let card of recipeCards) {
        card.setAttribute('draggable', true);
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.outerHTML);
        });
    }

    for (let column of dayColumns) {
        column.addEventListener('dragover', (e) => e.preventDefault());
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const recipeHTML = e.dataTransfer.getData('text/plain');
            column.innerHTML += recipeHTML;
            setupDragAndDrop(); // Rebind events to newly added elements
        });
    }
}

function exportMealPlan() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const plan = days.map(day => {
        const dayColumn = document.getElementById(day);
        const meals = Array.from(dayColumn.querySelectorAll('.recipe-card')).map(card => card.querySelector('h3').innerText);
        return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${meals.join(', ') || 'No meals'}`;
    });

    const blob = new Blob([plan.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MealPlan.txt';
    link.click();
}
