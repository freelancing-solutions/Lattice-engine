#!/usr/bin/env python3
"""
Script to systematically fix all relative imports to absolute imports.
"""

import os
import re
from pathlib import Path

def fix_relative_imports(file_path: Path, project_root: str = "lattice_mutation_engine"):
    """Fix relative imports in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Get the relative path from project root to determine the current module path
        relative_path = file_path.relative_to(Path(__file__).parent)
        current_module_parts = relative_path.parent.parts
        
        # Pattern to match relative imports
        patterns = [
            # from ..module import something
            (r'from \.\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*) import', 
             rf'from {project_root}.\1 import'),
            
            # from .module import something  
            (r'from \.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*) import',
             rf'from {project_root}.{".".join(current_module_parts)}.\1 import'),
             
            # from ... import (multi-level up)
            (r'from \.\.\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*) import',
             rf'from {project_root}.\1 import'),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        # Special handling for queue -> celery_queue
        content = content.replace(f'{project_root}.queue.', f'{project_root}.celery_queue.')
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed imports in: {file_path}")
            return True
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
    
    return False

def main():
    """Main function to fix all relative imports."""
    project_dir = Path(__file__).parent
    python_files = list(project_dir.rglob("*.py"))
    
    # Exclude this script and __pycache__ directories
    python_files = [f for f in python_files if f.name != "fix_imports.py" and "__pycache__" not in str(f)]
    
    fixed_count = 0
    for file_path in python_files:
        if fix_relative_imports(file_path):
            fixed_count += 1
    
    print(f"\nFixed imports in {fixed_count} files out of {len(python_files)} Python files.")

if __name__ == "__main__":
    main()