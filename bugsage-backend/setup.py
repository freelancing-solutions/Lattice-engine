"""
Setup script for BugSage Backend API
"""
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="bugsage-backend",
    version="1.0.0",
    author="BugSage Team",
    author_email="team@bugsage.dev",
    description="AI-powered debugging platform backend API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/bugsage/bugsage-backend",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Framework :: FastAPI",
        "Topic :: Software Development :: Debuggers",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.11",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
            "black>=23.0.0",
            "mypy>=1.5.0",
            "flake8>=6.0.0",
            "pre-commit>=3.3.0",
        ],
        "docs": [
            "mkdocs>=1.5.0",
            "mkdocs-material>=9.1.0",
            "mkdocstrings>=0.22.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "bugsage-api=app.main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "app": ["py.typed"],
    },
)