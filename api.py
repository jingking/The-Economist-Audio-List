#!/usr/bin/env python3
"""
Download recent Economist audio issues and extract them to separate folders.

Usage:
    python api.py                                      # Download the latest issue
    python api.py --n 3                                # Download the 3 most recent issues
    python api.py --date 2025-05-24                    # Download a specific issue by date
    python api.py --dest ~/Downloads/Economist         # Specify a download location
    python api.py --n 5 --dest /media/usb/audiobooks   # Download 5 issues to a specific location

Requires:
    pip install requests
"""

from __future__ import annotations
import argparse
import datetime as dt
import json
import logging as log
import pathlib as pl
import sys
import zipfile
from typing import List, Tuple

import requests

# ---------------------------------------------------------------------------
# Default configuration - can be overridden by command line arguments
DEFAULT_DEST = pl.Path("/srv/media/Books/Audiobooks").expanduser()  # default destination for files
KEEP_ZIP = False                                           # set True if you want to keep the original .zip
# ---------------------------------------------------------------------------

INDEX_URL = "https://jingking.github.io/The-Economist-Audio-List/searchEditions2025.json"
CDN = "https://economist.com/mobile-assets/{id}-audio.zip"

log.basicConfig(level=log.INFO, format="%(asctime)s %(levelname)s: %(message)s")


# ---------- helpers ---------------------------------------------------------


def get_all_issues() -> List[Tuple[str, str]]:
    """Return a list of all available issues from the JSON index.
    
    Returns:
        List of tuples containing (tegId, date) for all issues
    """
    resp = requests.get(INDEX_URL, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    
    issues = []
    for edge in data["data"]["searchEditions"]["edges"]:
        node = edge["node"]
        issues.append((node["tegId"], node["issueDate"][:10]))
    
    return issues


def get_recent_issues(count: int = 1) -> List[Tuple[str, str]]:
    """Return list of (tegId, yyyy-mm-dd) for the most recent editions in the JSON index.
    
    Args:
        count: Number of recent issues to return (default: 1)
    
    Returns:
        List of tuples containing (tegId, date) for each issue
    """
    issues = get_all_issues()
    return issues[:count]


def find_issues_by_date(date_str: str) -> List[Tuple[str, str]]:
    """Find issues matching a specific date.
    
    Args:
        date_str: Date string in YYYY-MM-DD format
        
    Returns:
        List of matching issues (usually just one)
    """
    all_issues = get_all_issues()
    return [(tag, issue_date) for tag, issue_date in all_issues if issue_date == date_str]


def download_zip(tag: str, out: pl.Path) -> None:
    url = CDN.format(id=tag)
    log.info("Downloading %s", url)
    with requests.get(url, stream=True, timeout=30) as r:
        r.raise_for_status()
        with out.open("wb") as fh:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    fh.write(chunk)
    log.info("Saved ZIP %s (%.1f MB)", out, out.stat().st_size / (1024 * 1024))


# We've replaced this with the extract_zip_to_folder function


def extract_zip_to_folder(zip_path: pl.Path, output_dir: pl.Path) -> List[pl.Path]:
    """Extract ZIP file to the specified directory and return a list of MP3 files."""
    with zipfile.ZipFile(zip_path) as z:
        log.info(f"Extracting ZIP to {output_dir}")
        z.extractall(output_dir)
    
    # Find all MP3 files in the extracted content
    mp3s = sorted(
        (p for p in output_dir.rglob("*.mp3")),
        key=lambda p: int(p.name.split("-")[0]) if p.name.split("-")[0].isdigit() else 0
    )
    
    log.info(f"Found {len(mp3s)} MP3 files")
    return mp3s


# ---------- main ------------------------------------------------------------


def process_issue(tag: str, date_str: str, dest_path: pl.Path) -> bool:
    """Download and extract a single issue.
    
    Args:
        tag: The tegId of the issue
        date_str: The date string in YYYY-MM-DD format
        dest_path: The destination directory for extracted files
        
    Returns:
        True if successful, False otherwise
    """
    # Format the date for a more readable filename
    date_obj = dt.datetime.strptime(date_str, "%Y-%m-%d")
    
    # Get the week range for the issue (start and end dates)
    start_date = date_obj
    end_date = start_date + dt.timedelta(days=6)  # Economist typically covers a week
    
    # Format for folder name: "The Economist Audio Edition - Month Day - Day Year"
    folder_name = f"The Economist Audio Edition - {start_date.strftime('%B %d')}th - {end_date.strftime('%d')}th {start_date.year}"
    output_dir = dest_path / folder_name
    
    if output_dir.exists():
        log.info("Already have %s, skipping.", output_dir.name)
        return True

    # Create the destination directory
    output_dir.mkdir(exist_ok=True)
    
    try:
        # Download the ZIP file directly to the destination folder
        zip_path = output_dir / f"{tag}.zip"
        download_zip(tag, zip_path)
        
        # Extract the contents directly to the destination folder
        mp3s = extract_zip_to_folder(zip_path, output_dir)
        
        # Clean up the ZIP file if not keeping it
        if not KEEP_ZIP:
            zip_path.unlink()
            log.info(f"Removed ZIP file: {zip_path.name}")
        
        # Check if extraction was successful
        if not mp3s:
            log.error("ZIP contained no MP3s")
            return False
        
        log.info(f"Successfully extracted {len(mp3s)} MP3 files to {output_dir}")
        return True
    
    except Exception as e:
        log.error(f"Failed to process issue {date_str}: {e}")
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description='Download Economist audio issues')
    parser.add_argument('--n', type=int, default=1, help='Number of recent issues to download (default: 1)')
    parser.add_argument('--date', type=str, help='Specific date to download (YYYY-MM-DD format)')
    parser.add_argument('--dest', type=str, default=str(DEFAULT_DEST), 
                        help=f'Destination directory for downloads (default: {DEFAULT_DEST})')
    args = parser.parse_args()
    
    # Set destination path from argument
    dest_path = pl.Path(args.dest).expanduser()
    dest_path.mkdir(parents=True, exist_ok=True)
    
    if args.date:
        # Download a specific date
        try:
            # Validate date format
            dt.datetime.strptime(args.date, "%Y-%m-%d")
            issues = find_issues_by_date(args.date)
            if not issues:
                log.error(f"No issues found for date {args.date}")
                sys.exit(1)
        except ValueError:
            log.error("Invalid date format. Please use YYYY-MM-DD")
            sys.exit(1)
    else:
        # Get the specified number of recent issues
        issues = get_recent_issues(args.n)
    
    if not issues:
        log.error("No issues found")
        sys.exit(1)
    
    log.info(f"Found {len(issues)} issues to download")
    
    successful = 0
    for i, (tag, date_str) in enumerate(issues):
        log.info(f"Processing issue {i+1}/{len(issues)}: {date_str}")
        if process_issue(tag, date_str, dest_path):
            successful += 1
    
    log.info(f"All done. Successfully processed {successful}/{len(issues)} issues.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled.")
    except Exception as e:
        log.error(f"Error: {e}")
        sys.exit(1)
