"""
train_and_save_urlguard.py

A complete, robust, well-documented script to:
 - Load the malicious URL dataset (malicious_phish.csv expected in same folder)
 - Clean / inspect the data
 - Extract URL features
 - Build a scikit-learn Pipeline that contains the vectorizer + classifier
 - Train / evaluate the model
 - Serialize the entire pipeline to a single joblib file
 - Verify the saved file by loading it and making a test prediction

Notes:
 - This script is written to be run locally (e.g., VS Code) and assumes necessary packages are installed.
 - If your dataset filename differs, change CSV_NAME below.
"""

import os
import re
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from scipy.sparse import csr_matrix

from utils.url_features import URLFeatureExtractor

# -------------------------
# CONFIG
# -------------------------
CSV_NAME = "malicious_phish.csv"   # dataset filename (must be in same folder)
OUT_PIPELINE = os.path.join("models", "url_guard_pipeline.joblib")
RANDOM_STATE = 42
TEST_SIZE = 0.20
DOMAIN_MAX_FEATURES = 2000         # limit vocabulary size to keep memory reasonable
RF_ESTIMATORS = 300               # number of trees (tune higher if you want more accuracy)
SAVE_PLOTS = True                  # save evaluation plots to disk

# -------------------------
# 1) Data Loading and Inspection
# -------------------------
print("1) Loading data...")
if not os.path.exists(CSV_NAME):
    raise FileNotFoundError(f"Dataset not found: {CSV_NAME}. Put it in the same folder as this script.")

df = pd.read_csv(CSV_NAME)
print(f"Dataset loaded: rows={df.shape[0]}, columns={df.shape[1]}")
print("Columns:", df.columns.tolist())
print("Basic info:")
print(df.info())
print("\nMissing values per column:\n", df.isnull().sum())
print("\nSample rows:")
print(df.head())

# -------------------------
# 2) Data Cleaning & Preprocessing
# -------------------------
print("\n2) Cleaning data...")

# 2.a Drop exact duplicate rows (keeps first occurrence)
dups = df.duplicated().sum()
print("Duplicate rows found:", dups)
if dups > 0:
    df = df.drop_duplicates().reset_index(drop=True)
    print("Duplicates removed. New shape:", df.shape)

# 2.b Ensure expected columns exist
expected_cols = {"url", "type"}
if not expected_cols.issubset(set(df.columns)):
    raise ValueError(f"Dataset must contain columns: {expected_cols}. Found: {df.columns.tolist()}")

# 2.c No missing values were reported earlier; if present handle them:
if df["url"].isnull().any() or df["type"].isnull().any():
    # For URLs, drop missing rows (can't extract features)
    df = df.dropna(subset=["url", "type"]).reset_index(drop=True)
    print("Dropped rows with missing url/type. New shape:", df.shape)

# 2.d Check class distribution (important for stratified split)
print("\nClass distribution:\n", df["type"].value_counts())


print("\n4) Building feature pipeline and model pipeline...")

# We'll use a ColumnTransformer:
# - numeric features are passed through from the DataFrame produced by URLFeatureExtractor
# - domain is vectorized using CountVectorizer; we limit vocabulary size for memory safety
numeric_features = ["url_length", "num_digits", "num_letters", "num_special_chars", "num_dots", "num_slashes", "entropy"]

# Transformer that extracts features DataFrame first; we will run ColumnTransformer on that
feature_extractor = URLFeatureExtractor()

# ColumnTransformer expects column names from the output of feature_extractor,
# but to integrate cleanly we will use a small wrapper pipeline:
# 1) feature_extractor (produces a DataFrame)
# 2) ColumnTransformer which takes columns from that DataFrame

# Build the ColumnTransformer
column_transformer = ColumnTransformer(
    transformers=[
        # numeric columns: passthrough (we will convert to array automatically)
        ("num", "passthrough", numeric_features),
        # domain: CountVectorizer on domain string
        ("dom", CountVectorizer(max_features=DOMAIN_MAX_FEATURES), "domain"),
    ],
    remainder="drop",  # drop any other columns
    sparse_threshold=0.0  # ensure result is sparse if any transformer returns sparse
)

# Final pipeline: feature_extractor -> column_transformer -> classifier
pipeline = Pipeline([
    ("extract", feature_extractor),
    ("columns", column_transformer),
    ("clf", RandomForestClassifier(n_estimators=RF_ESTIMATORS, random_state=RANDOM_STATE, n_jobs=-1, class_weight="balanced"))
])

# -------------------------
# 6) Train/Test Split and Model Training
# -------------------------
print("\n5) Splitting data and training the model...")
X = df[["url"]].copy()   # pipeline expects a DataFrame or Series with 'url'
y = df["type"].astype(str)  # labels as strings

# Stratified split to preserve class proportions
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y)

print("Train size:", X_train.shape[0], "Test size:", X_test.shape[0])

# Fit the full pipeline (extractor + vectorizer + classifier)
print("Training started (this can take some minutes depending on RF_ESTIMATORS)...")
pipeline.fit(X_train, y_train)
print("Training completed.")

# -------------------------
# 7) Evaluation
# -------------------------
print("\n6) Evaluating model on test set...")
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {acc:.4f}\n")
print("Classification Report:")
print(classification_report(y_test, y_pred))
cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:\n", cm)

# Save confusion matrix heatmap
plt.figure(figsize=(8,6))
labels_sorted = sorted(y.unique())
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels_sorted, yticklabels=labels_sorted)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
if SAVE_PLOTS:
    plt.savefig("eval_confusion_matrix.png")
plt.show()

# -------------------------
# 8) Serialization (save pipeline) and verification
# -------------------------
print("\n7) Serializing pipeline to joblib and verifying...")

# Save the pipeline object (this includes feature extractor, vectorizer, and classifier)
joblib.dump(pipeline, OUT_PIPELINE, compress=3)
print(f"Saved pipeline to: {OUT_PIPELINE}")

# Verify by loading and making a sample prediction
print("Verifying saved pipeline by loading it back and predicting a sample URL...")
loaded = joblib.load(OUT_PIPELINE)

sample_urls = [
    "https://www.google.com",
    "http://paypal.verify-login-security.com/login",
    "http://example-malware-site.ru/evil.exe"
]

# Create DataFrame as pipeline expects
sample_df = pd.DataFrame({"url": sample_urls})
preds = loaded.predict(sample_df)
for u, p in zip(sample_urls, preds):
    print(f"URL: {u}\n  => Prediction: {p}")

print("\nVerification completed successfully. Pipeline is saved and working.")

# -------------------------
# END
# -------------------------
