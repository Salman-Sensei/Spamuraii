import math
import tldextract
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class URLFeatureExtractor(BaseEstimator, TransformerMixin):
    """Feature extractor for URL strings.

    Accepts a DataFrame or Series containing a 'url' column and returns
    a pandas DataFrame with numeric features plus a 'domain' column.
    This matches the expectations of train_url_model.py.
    """

    def __init__(self):
        pass

    @staticmethod
    def _get_domain(url: str) -> str:
        try:
            ext = tldextract.extract(url)
            return ext.domain if ext.domain else ""
        except Exception:
            return ""

    @staticmethod
    def _count_digits(url: str) -> int:
        return sum(c.isdigit() for c in url)

    @staticmethod
    def _count_letters(url: str) -> int:
        return sum(c.isalpha() for c in url)

    @staticmethod
    def _count_special(url: str) -> int:
        return sum(not c.isalnum() for c in url)

    @staticmethod
    def _count_dots(url: str) -> int:
        return url.count(".")

    @staticmethod
    def _count_slashes(url: str) -> int:
        return url.count("/")

    @staticmethod
    def _url_length(url: str) -> int:
        return len(url)

    @staticmethod
    def _entropy(url: str) -> float:
        try:
            chars = list(dict.fromkeys(list(url)))
            probs = [float(url.count(c)) / len(url) for c in chars]
            return -sum(p * math.log(p, 2) for p in probs)
        except Exception:
            return 0.0

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        """Transform input URLs into a feature DataFrame.

        X can be a DataFrame with a 'url' column, or a Series/ndarray of URLs.
        """
        if isinstance(X, (pd.Series, np.ndarray)) and not isinstance(X, pd.DataFrame):
            urls = pd.Series(X)
        elif isinstance(X, pd.DataFrame):
            if "url" not in X.columns:
                raise ValueError("Input DataFrame must contain 'url' column")
            urls = X["url"].astype(str)
        else:
            raise ValueError("Input must be a pandas DataFrame or Series containing URLs")

        feat = pd.DataFrame()
        feat["url"] = urls
        feat["url_length"] = urls.apply(self._url_length)
        feat["num_digits"] = urls.apply(self._count_digits)
        feat["num_letters"] = urls.apply(self._count_letters)
        feat["num_special_chars"] = urls.apply(self._count_special)
        feat["num_dots"] = urls.apply(self._count_dots)
        feat["num_slashes"] = urls.apply(self._count_slashes)
        feat["entropy"] = urls.apply(self._entropy)
        feat["domain"] = urls.apply(self._get_domain)
        return feat
