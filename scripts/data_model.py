import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.utils.class_weight import compute_class_weight
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
import joblib

file_path = '../sql/ticketTrainingGround.csv'
df = pd.read_csv(file_path)

df['combined_text'] = df['title'] + " " + df['description'] + " " + df['status']

X = df['combined_text']
y = df['category']

vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=10000,     
    ngram_range=(1, 3)        
)
X_tfidf = vectorizer.fit_transform(X)

# Split the data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X_tfidf, y, test_size=0.2, random_state=42
)

class_weights = compute_class_weight(
    'balanced', classes=pd.unique(df['category']), y=y_train
)
class_weight_dict = {c: w for c, w in zip(pd.unique(df['category']), class_weights)}

model_lr = LogisticRegression(
    penalty='l2',
    C=0.1,                     
    max_iter=1000,
    class_weight=class_weight_dict,
    random_state=42
)
model_lr.fit(X_train, y_train)

model_svc = LinearSVC(
    class_weight=class_weight_dict,
    random_state=42
)
model_svc.fit(X_train, y_train)

model_rf = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',
    random_state=42
)
model_rf.fit(X_train, y_train)

models = {'Logistic Regression': model_lr, 'SVM': model_svc, 'Random Forest': model_rf}

for model_name, model in models.items():
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model: {model_name}")
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("-" * 60)

best_model = model_lr 

test_descriptions = [
    "My invoice shows an overcharge, needs correction.",                # Billing
    "Computer is not responding, requires troubleshooting.",            # Technical Support
    "I have a question about product features.",                        # General Inquiry
    "Device is broken, needs replacement.",                             # Device Replacement
    "Account was hacked, needs immediate attention.",                   # Security
    "I would like to return my purchase for a refund.",                 # Refund Request
    "Need assistance with setting up my new laptop.",                   # Technical Support
    "Experiencing issues with my network connection.",                  # Technical Support
    "Feedback on your customer service.",                               # Feedback
    "Inquiry about extending my warranty period."                       # Warranty Inquiry
]

test_tfidf = vectorizer.transform(test_descriptions)
test_predictions = best_model.predict(test_tfidf)

for desc, category in zip(test_descriptions, test_predictions):
    print(f"Description: {desc}\nPredicted Category: {category}\n")

# Cross-validation to evaluate model performance
scores = cross_val_score(best_model, X_tfidf, y, cv=5)
print(f"Cross-validation scores: {scores}")
print(f"Mean accuracy: {scores.mean():.2f}")


joblib.dump(best_model, 'ticket_classifier_model.pkl')

joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')