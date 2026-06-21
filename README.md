
# 🍳 FlavourGraph

FlavourGraph is an intelligent recipe recommendation web application that helps users discover recipes based on the ingredients they already have at home.

Instead of searching for recipes manually, users simply enter available ingredients and FlavourGraph intelligently suggests recipes, identifies missing ingredients, and recommends suitable substitutions.

---

## 🚀 Features

### 🔍 Smart Recipe Matching
- Find recipes using available ingredients.
- Greedy matching algorithm ranks recipes based on ingredient availability.

### 🥘 Missing Ingredient Detection
- Shows ingredients required to complete a recipe.
- Helps users plan meals efficiently.

### 🔄 Ingredient Substitution Engine
- Suggests alternative ingredients when required items are unavailable.
- Uses ingredient relationship mapping for smarter recommendations.

### ✨ Typo-Tolerant Search
- Handles spelling mistakes and ingredient variations.
- Improves user experience and search accuracy.

### 📖 Rich Recipe Information
- Recipe name
- Preparation steps
- Ingredient list
- Recipe images

### 🎨 Responsive User Interface
- Modern and clean design.
- Built using Bootstrap, HTML, CSS, and JavaScript.
- Works across desktop and mobile devices.

---

## 🏗️ Project Architecture

```text
User Input Ingredients
          │
          ▼
    Flask Backend
          │
          ▼
 Recipe Matching Engine
          │
          ▼
 Substitution Engine
          │
          ▼
 Spoonacular API
          │
          ▼
   Recipe Results
```

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap
- JavaScript

### Backend
- Python
- Flask

### APIs
- Spoonacular API

### Libraries
- Requests
- NetworkX
- NumPy
- JSON Handling

---

## 📂 Project Structure

```text
flavourgraph/
│
├── app.py
├── requirements.txt
├── templates/
│   ├── index.html
│   └── results.html
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── utils/
│   ├── recipe_matcher.py
│   └── substitution_engine.py
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/appinenikarthik/flavourgraph.git
cd flavourgraph
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
SPOONACULAR_API_KEY=your_api_key_here
```

---

## ▶️ Run Application

```bash
python app.py
```

Or

```bash
flask run
```

Open:

```text
http://localhost:5000
```

---

## 📌 How It Works

1. User enters available ingredients.
2. Backend processes ingredient list.
3. Recipe matching algorithm finds suitable recipes.
4. Missing ingredients are identified.
5. Substitution engine suggests alternatives.
6. Results are displayed on the web interface.

---

## 📸 Example

### Input

```text
Tomato, Onion, Garlic
```

### Output

```text
Recipe:
Tomato Soup

Missing Ingredients:
- Cream

Suggested Substitutes:
- Milk
- Coconut Milk
```

---

## 🎯 Learning Outcomes

This project helped in understanding:

- Full Stack Web Development
- REST API Integration
- Flask Framework
- Data Structures & Algorithms
- Graph-Based Ingredient Relationships
- Frontend-Backend Communication
- User Experience Design

---

## 🔮 Future Enhancements

- User Authentication
- Save Favorite Recipes
- AI-Based Recipe Recommendations
- Meal Planning Feature
- Nutrition Tracking
- Voice-Based Ingredient Search
- Dark Mode Support

---

## 🤝 Contributors

- Appineni Karthik
- Betrala Gowtham
- D. Sajid

Guided by:
- Gaurav Mandloi
- Gurtej Singh
- Dr. Kamal Sutaria

---

## 📜 License

This project is developed for educational and learning purposes.

Feel free to fork, modify, and improve the project.

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the repository

📢 Share it with others

---

**Made with ❤️ using Python, Flask, and Spoonacular API**
