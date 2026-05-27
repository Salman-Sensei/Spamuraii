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
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from scipy.sparse import csr_matrix
from tqdm import tqdm

from utils.url_features import URLFeatureExtractor

# -------------------------
# CONFIG
# -------------------------
# Combined dataset paths
CSV_PATH_1 = os.path.join(os.path.dirname(__file__), "..", "..", "untitled folder", "malicious_phish.csv")
CSV_PATH_2 = os.path.join(os.path.dirname(__file__), "..", "..", "untitled folder", "phishing_site_urls.csv")
OUT_PIPELINE = os.path.join("models", "url_guard_pipeline.joblib")
RANDOM_STATE = 42
TEST_SIZE = 0.20
DOMAIN_MAX_FEATURES = 1500        # optimized for speed + accuracy balance
MAX_ITER = 300                    # HistGradientBoosting iterations (more = better accuracy but slower)
SAVE_PLOTS = True                 # show confusion matrix and metrics
MAX_SAMPLES = None                # None = use ALL data (full dataset training)
USE_HIST_GRADIENT = True          # Use HistGradientBoosting (faster + more accurate)
COMBINE_DATASETS = True           # Combine both CSV files for maximum data

# -------------------------
# 1) Data Loading and Inspection
# -------------------------
print("1) Loading data...")
dfs = []

if COMBINE_DATASETS:
    # Load first dataset (malicious_phish.csv - 4 classes)
    if os.path.exists(CSV_PATH_1):
        print(f"Loading {os.path.basename(CSV_PATH_1)}...")
        df1 = pd.read_csv(CSV_PATH_1)
        print(f"  ✓ Loaded {len(df1):,} rows")
        dfs.append(df1)
    else:
        print(f"⚠️  Warning: {CSV_PATH_1} not found")
    
    # Load second dataset (phishing_site_urls.csv - 2 classes)
    if os.path.exists(CSV_PATH_2):
        print(f"Loading {os.path.basename(CSV_PATH_2)}...")
        df2 = pd.read_csv(CSV_PATH_2)
        print(f"  ✓ Loaded {len(df2):,} rows")
        dfs.append(df2)
    else:
        print(f"⚠️  Warning: {CSV_PATH_2} not found")
    
    if not dfs:
        raise FileNotFoundError("No datasets found!")
    
    # Combine datasets
    print("\nCombining datasets...")
    if len(dfs) == 2:
        # Normalize column names for df2
        if "URL" in dfs[1].columns:
            dfs[1] = dfs[1].rename(columns={"URL": "url"})
        if "Label" in dfs[1].columns:
            dfs[1] = dfs[1].rename(columns={"Label": "type"})
            # Map labels: good→benign, bad→phishing
            dfs[1]["type"] = dfs[1]["type"].map({"good": "benign", "bad": "phishing"})
        
        df = pd.concat([dfs[0], dfs[1]], ignore_index=True)
        print(f"  ✓ Combined: {len(df):,} total rows")
    else:
        df = dfs[0]
else:
    # Single dataset mode
    if os.path.exists(CSV_PATH_1):
        csv_file = CSV_PATH_1
    elif os.path.exists(CSV_PATH_2):
        csv_file = CSV_PATH_2
    else:
        raise FileNotFoundError(f"Dataset not found. Tried: {CSV_PATH_1} and {CSV_PATH_2}")
    
    df = pd.read_csv(csv_file)
    if "URL" in df.columns:
        df = df.rename(columns={"URL": "url"})
    if "Label" in df.columns:
        df = df.rename(columns={"Label": "type"})

print(f"\nDataset loaded: rows={df.shape[0]:,}, columns={df.shape[1]}")
print("Columns:", df.columns.tolist())
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

# 2.b Normalize column names and labels
# Handle different CSV formats: "URL"/"Label" or "url"/"type"
if "URL" in df.columns:
    df = df.rename(columns={"URL": "url"})
if "Label" in df.columns:
    df = df.rename(columns={"Label": "type"})
    
# Ensure we have url and type columns
expected_cols = {"url", "type"}
if not expected_cols.issubset(set(df.columns)):
    raise ValueError(f"Dataset must contain columns: {expected_cols}. Found: {df.columns.tolist()}")
    
# Normalize label values: map "bad" to "phishing", keep other values as-is
if "type" in df.columns:
    df["type"] = df["type"].astype(str).str.lower()
    # Map common label variations - keep original 4 classes if available
    label_mapping = {
        "bad": "phishing",  # Default bad to phishing if no other info
        "malicious": "malware",
        "malware": "malware",
        "phish": "phishing",
        "phishing": "phishing",
        "defacement": "defacement",
        "deface": "defacement",
        "benign": "benign",
        "good": "benign",
        "safe": "benign"
    }
    df["type"] = df["type"].map(lambda x: label_mapping.get(x, x))
    print(f"\nLabel mapping applied. Unique labels: {df['type'].unique()}")

# 2.c No missing values were reported earlier; if present handle them:
if df["url"].isnull().any() or df["type"].isnull().any():
    # For URLs, drop missing rows (can't extract features)
    df = df.dropna(subset=["url", "type"]).reset_index(drop=True)
    print("Dropped rows with missing url/type. New shape:", df.shape)

# 2.d Check class distribution and add benign URLs if needed
print("\nClass distribution:\n", df["type"].value_counts())

# If we only have malicious URLs, we need to add some benign URLs for training
# Common benign domains for balance
if "benign" not in df["type"].values:
    print("\n⚠️  Warning: No benign URLs found. Adding sample benign URLs for balanced training...")
    benign_urls = [
        "https://www.google.com",
        "https://www.github.com",
        "https://www.microsoft.com",
        "https://www.apple.com",
        "https://www.amazon.com",
        "https://www.facebook.com",
        "https://www.twitter.com",
        "https://www.linkedin.com",
        "https://www.youtube.com",
        "https://www.netflix.com",
        "https://www.spotify.com",
        "https://www.wikipedia.org",
        "https://www.stackoverflow.com",
        "https://www.reddit.com",
        "https://www.instagram.com",
        "https://www.paypal.com",
        "https://www.ebay.com",
        "https://www.adobe.com",
        "https://www.oracle.com",
        "https://www.ibm.com",
        "https://www.intel.com",
        "https://www.nvidia.com",
        "https://www.cisco.com",
        "https://www.salesforce.com",
        "https://www.zoom.us",
        "https://www.slack.com",
        "https://www.dropbox.com",
        "https://www.airbnb.com",
        "https://www.uber.com",
        "https://www.tesla.com"
    ]
    
    # Add enough benign URLs to balance the dataset (aim for ~20-30% benign)
    num_benign_needed = min(len(df) // 3, len(benign_urls))  # Add up to 1/3 of dataset size
    benign_df = pd.DataFrame({
        "url": benign_urls[:num_benign_needed],
        "type": ["benign"] * num_benign_needed
    })
    df = pd.concat([df, benign_df], ignore_index=True)
    print(f"Added {num_benign_needed} benign URLs. New dataset size: {len(df)}")
    print("Updated class distribution:\n", df["type"].value_counts())

# 2.e Limit dataset size for faster training if MAX_SAMPLES is set
if MAX_SAMPLES and len(df) > MAX_SAMPLES:
    print(f"\n📊 Dataset has {len(df)} rows. Sampling {MAX_SAMPLES} rows for faster training...")
    # Stratified sampling to maintain class distribution
    df = df.groupby('type', group_keys=False).apply(
        lambda x: x.sample(min(len(x), MAX_SAMPLES // len(df['type'].unique())), random_state=RANDOM_STATE)
    ).reset_index(drop=True)
    print(f"Sampled dataset size: {len(df)}")
    print("Sampled class distribution:\n", df["type"].value_counts())


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
# Use HistGradientBoosting for faster training with better accuracy
if USE_HIST_GRADIENT:
    print("\n🚀 Using HistGradientBoosting (optimized for speed + accuracy)...")
    classifier = HistGradientBoostingClassifier(
        max_iter=MAX_ITER,
        random_state=RANDOM_STATE,
        class_weight="balanced",
        verbose=1,  # Show progress
        max_bins=255,  # More bins = better accuracy
        learning_rate=0.1,  # Faster convergence
        max_depth=12,  # Balanced depth for speed
        min_samples_leaf=20,
        l2_regularization=0.1,  # Prevent overfitting
        early_stopping=True,  # Stop if no improvement
        validation_fraction=0.1,  # 10% for validation
        n_iter_no_change=20,  # Stop after 20 iterations without improvement
        tol=1e-7
    )
else:
    print("\n🌳 Using RandomForest...")
    classifier = RandomForestClassifier(
        n_estimators=200, 
        random_state=RANDOM_STATE, 
        n_jobs=-1,
        class_weight="balanced", 
        verbose=1,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=5,
        max_features='sqrt'
    )

pipeline = Pipeline([
    ("extract", feature_extractor),
    ("columns", column_transformer),
    ("clf", classifier)
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
print("\n🚀 Starting training pipeline...")
print(f"📊 Dataset Info:")
print(f"   - Total samples: {len(df):,}")
print(f"   - Training samples: {len(X_train):,}")
print(f"   - Test samples: {len(X_test):,}")
if USE_HIST_GRADIENT:
    print(f"   - HistGradientBoosting iterations: {MAX_ITER}")
    print(f"   - Learning rate: 0.1")
    print(f"   - Max depth: 12")
    print(f"   - Early stopping: Enabled")
else:
    print(f"   - Random Forest trees: 200")
print(f"   - Features: {DOMAIN_MAX_FEATURES} domain features")
print("\n⏳ Training model (progress will be shown below)...\n")

# Track training time with progress
import time
start_time = time.time()

# Show progress for feature extraction
print("Step 1/2: Extracting features from URLs...")
print("(This may take a moment for large datasets)\n")

# Fit the pipeline - HistGradientBoosting will show its own progress
pipeline.fit(X_train, y_train)

elapsed_time = time.time() - start_time
minutes = elapsed_time / 60
print(f"\n✅ Training completed!")
print(f"⏱️  Time: {elapsed_time:.2f} seconds ({minutes:.2f} minutes)")
print(f"📈 Model trained on {len(X_train):,} samples")
if USE_HIST_GRADIENT:
    actual_iter = getattr(pipeline.named_steps['clf'], 'n_iter_', MAX_ITER)
    print(f"🔄 Iterations completed: {actual_iter}/{MAX_ITER}")

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

# Save confusion matrix and evaluation metrics (only if SAVE_PLOTS is True)
if SAVE_PLOTS:
    print("\n📊 Generating evaluation visualizations...")
    
    # Create figure with subplots
    fig = plt.figure(figsize=(16, 10))
    
    # 1. Confusion Matrix
    ax1 = plt.subplot(2, 2, 1)
    labels_sorted = sorted(y.unique())
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels_sorted, yticklabels=labels_sorted, 
                cbar_kws={'label': 'Count'}, linewidths=0.5, ax=ax1)
    ax1.set_title("Confusion Matrix", fontsize=14, fontweight='bold')
    ax1.set_xlabel("Predicted Label", fontsize=12)
    ax1.set_ylabel("Actual Label", fontsize=12)
    
    # 2. Metrics Bar Chart
    ax2 = plt.subplot(2, 2, 2)
    from sklearn.metrics import precision_recall_fscore_support
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average=None, labels=labels_sorted)
    
    # Prepare metrics data (accuracy is shown separately, not per class)
    metrics_data = {
        'Precision': precision,
        'Recall': recall,
        'F1-Score': f1
    }
    
    x = np.arange(len(labels_sorted))
    width = 0.25
    colors = ['#3498db', '#2ecc71', '#e74c3c']
    
    for i, (metric_name, values) in enumerate(metrics_data.items()):
        ax2.bar(x + i*width, values, width, label=metric_name, color=colors[i], alpha=0.8)
    
    ax2.set_xlabel('Class', fontsize=12)
    ax2.set_ylabel('Score', fontsize=12)
    ax2.set_title('Evaluation Metrics by Class', fontsize=14, fontweight='bold')
    ax2.set_xticks(x + width)
    ax2.set_xticklabels(labels_sorted)
    ax2.set_ylim([0, 1.1])
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    for i, (metric_name, values) in enumerate(metrics_data.items()):
        for j, val in enumerate(values):
            ax2.text(x[j] + i*width, val + 0.02, f'{val:.3f}', ha='center', va='bottom', fontsize=8)
    
    # 3. Overall Metrics Summary
    ax3 = plt.subplot(2, 2, 3)
    overall_metrics = {
        'Accuracy': acc,
        'Macro Avg Precision': precision.mean(),
        'Macro Avg Recall': recall.mean(),
        'Macro Avg F1': f1.mean()
    }
    
    bars = ax3.bar(overall_metrics.keys(), overall_metrics.values(), color=['#3498db', '#2ecc71', '#e74c3c', '#f39c12'], alpha=0.8)
    ax3.set_ylabel('Score', fontsize=12)
    ax3.set_title('Overall Model Performance', fontsize=14, fontweight='bold')
    ax3.set_ylim([0, 1.1])
    ax3.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bar, (key, val) in zip(bars, overall_metrics.items()):
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 0.02,
                f'{val:.4f}', ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    # Rotate x-axis labels
    plt.setp(ax3.xaxis.get_majorticklabels(), rotation=15, ha='right')
    
    # 4. Class Distribution in Test Set
    ax4 = plt.subplot(2, 2, 4)
    class_counts = pd.Series(y_test).value_counts().sort_index()
    colors_pie = ['#2ecc71', '#e74c3c']
    wedges, texts, autotexts = ax4.pie(class_counts.values, labels=class_counts.index, autopct='%1.1f%%',
                                       colors=colors_pie, startangle=90, textprops={'fontsize': 12})
    ax4.set_title('Test Set Class Distribution', fontsize=14, fontweight='bold')
    
    # Make percentage text bold
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    plt.suptitle('URL Phishing Detection Model - Evaluation Metrics', fontsize=16, fontweight='bold', y=0.995)
    plt.tight_layout()
    plt.savefig("eval_confusion_matrix.png", dpi=150, bbox_inches='tight')
    print("✅ Evaluation metrics visualization saved to eval_confusion_matrix.png")
    plt.close()  # Close to free memory
else:
    print("Skipping plot generation (SAVE_PLOTS=False)")

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
