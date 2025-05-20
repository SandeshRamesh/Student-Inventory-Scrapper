
# 🎓 Teacher Inventory Management System

A custom Google Apps Script-powered solution to manage student inventory, track lesson metrics, monitor attendance, and support operational visibility in a dance studio or educational setting.

## 📌 Overview

This system is designed to give teachers and managers a real-time, centralized interface for:

* Tracking weekly and historical lesson attendance
* Identifying missing or at-risk students
* Monitoring department-specific trends (Front vs. Back)
* Highlighting color-coded statuses and performance insights

Built entirely in Google Apps Script, it integrates with Google Sheets to power intelligent dashboards and automate inventory workflows.

## 🧩 Module Breakdown

| Script File          | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `Main.gs`            | Entry point for weekly processing, lesson counting, and dashboard updates  |
| `Live.gs`            | Pulls real-time lesson data from the current day and computes live metrics |
| `Analytics.gs`       | Compiles and stores weekly KPIs for teachers and department performance    |
| `MissingStudents.gs` | Detects students who missed lessons and flags them for follow-up           |
| `Helpers.gs`         | Shared utility functions for working with dates, ranges, and strings       |
| `SheetUtils.gs`      | Abstracts read/write logic for consistent and efficient Sheet access       |
| `StudentData.gs`     | Manages student profiles, departments, and lesson tracking per student     |
| `ColorScraper.gs`    | Extracts and interprets cell background colors to infer attendance context |
| `NFA_Inventory.gs`   | NFA-specific extensions to the general inventory system                    |

## ✅ Key Features

* 📊 **Dashboard Sync**: Aggregates teacher-level stats into a centralized KPI board.
* 🎯 **At-Risk Detection**: Flags students with low attendance or missed check-ins.
* 🗓 **Week Logic**: Aligns to a custom Tuesday–Saturday workweek.
* 🎨 **Color-Based Logic**: Leverages color coding to distinguish lesson types or flags.
* 📚 **Front vs. Back Department**: Tracks conversion, retention, and drop-off trends.

## 🔄 Weekly Workflow

1. Teachers record lesson data on their personal sheets.
2. The system calculates weekly totals and attendance shifts.
3. KPI metrics are pushed to a manager sheet for performance overview.
4. Missing students are logged for follow-up.
5. Color-coded flags update in real time via `Live.gs`.

## 📁 System Requirements

* Google Workspace account with Sheets access
* Admin setup of the master tracking sheets
* Trigger setup for weekly updates (via Google Apps Script time-driven triggers)

## 📦 Deployment Notes

* Scripts must be added to the bound Google Sheet via Apps Script editor
* Sheet tab names and formats should match those expected in the code
* Best used with structured naming conventions across teacher sheets

## 📌 To-Do / Future Ideas

* Add email alerts for missing students
* Integrate CRM or external follow-up tools
* Visual analytics with Google Charts
