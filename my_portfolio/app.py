from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route("/")
def index():
    # Data injected into template (pulled from your CV). Source: your uploaded CV. :contentReference[oaicite:1]{index=1}
    profile = {
        "name": "Jeet Shorey",
        "email": "shoreyjeet@gmail.com",
        "linkedin": "https://www.linkedin.com/in/jeet-shorey-b03922348/?originalSubdomain=in",
        "phone": "9833232395",
        "location": "Mumbai, India",
    }

    # top 3 projects (from your CV). :contentReference[oaicite:2]{index=2}
    top_projects = [
        {"title": "AMERICAN SIGN LANGUAGE DETECTION (2024)",
         "desc": "CNN-based real-time ASL gesture detection integrated with OpenCV."},
        {"title": "BRAILLE TO SPEECH (2024)",
         "desc": "Image-processing pipeline and text-to-speech for braille recognition."},
        {"title": "FOREX PRIVE PREDICTION PLATFORM (2024)",
         "desc": "LSTM-driven forex analytics with dashboards and portfolio analysis."},
    ]

    # tech stacks and skills (sourced from CV). :contentReference[oaicite:3]{index=3}
    tech_stack = ["Python", "TensorFlow/Keras", "React.js", "Docker", "AWS", "SQL/MongoDB"]
    tech_skills = [
        "Python","R","SQL","HTML5","CSS","JavaScript","NumPy","Pandas",
        "Scikit-learn","OpenCV","Streamlit","TensorFlow"
    ]

    # education snippet (include 10th from RBK School). :contentReference[oaicite:4]{index=4}
    education = [
        {"year":"2022 - 2026","degree":"B.Tech in Data Science, MPSTME, NMIMS"},
        {"year":"2020 - 2022","degree":"HSC, Queen's Mary"},
        {"year":"2020","degree":"ICSE (10th) - RBK School, Mira Road"}
    ]

    # five skills/domains to highlight near your photo
    five_skills = ["Data Science", "Machine Learning", "Computer Vision", "Time-Series", "Privacy-Preserving ML"]

    mission = None  # template contains exact 200-word mission paragraph (rendered inside template)

    return render_template("index.html",
                           profile=profile,
                           top_projects=top_projects,
                           tech_stack=tech_stack,
                           tech_skills=tech_skills,
                           education=education,
                           five_skills=five_skills)

if __name__ == "__main__":
    app.run(debug=True)
