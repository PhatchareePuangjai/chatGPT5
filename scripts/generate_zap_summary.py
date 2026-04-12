#!/usr/bin/env python3
"""Generate a DAST (ZAP) markdown summary from report artifacts."""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


HEADER_WARNING_KEYS = {
    "Missing Anti-clickjacking Header",
    "Content Security Policy (CSP) Header Not Set",
    "Cross-Origin-Embedder-Policy (COEP) Header Missing",
    "Cross-Origin-Opener-Policy (COOP) Header Missing",
    "Cross-Origin-Resource-Policy (CORP) Header Missing",
    "Permissions Policy Header Not Set",
    "X-Content-Type-Options Header Missing",
}

SUMMARY_PATTERNS = {
    "FAIL-NEW": re.compile(r"FAIL-NEW\s*[:|]\s*(\d+)", re.IGNORECASE),
    "WARN-NEW": re.compile(r"WARN-NEW\s*[:|]\s*(\d+)", re.IGNORECASE),
    "PASS": re.compile(r"PASS\s*[:|]\s*(\d+)", re.IGNORECASE),
}

SUMMARY_TABLE_ROW_RE = re.compile(r"^\|\s*(High|Medium|Low|Informational)\s*\|\s*(\d+)\s*\|\s*$", re.IGNORECASE)
ALERT_TABLE_ROW_RE = re.compile(r"^\|\s*(.+?)\s*\|\s*(High|Medium|Low|Informational)\s*\|\s*(\d+)\s*\|\s*$", re.IGNORECASE)
ALERT_HEADER_LINK_RE = re.compile(r"^###\s+\[\s*(.+?)\s*\]\((?:https?://[^/]+)?/docs/alerts/(\d+)/?.*\)\s*$")
ALERT_HEADER_RE = re.compile(r"^###\s+(.+?)\s+\[(\d+)\]\s*$")
RISK_ROW_RE = re.compile(r"^\|\s*Risk\s*\|\s*(.+?)\s*\|\s*$", re.IGNORECASE)
VERSION_RE = re.compile(r"(IM|SC|PD)(BP|CE|SD)\d{2}(?:_v\d+)?")
DEFAULT_RULE_TOTAL = 67


@dataclass(frozen=True)
class Alert:
    name: str
    rule_id: str
    severity: str


def normalize_alert_name(name: str) -> str:
    normalized = " ".join(name.split())
    replacements = {
        "Cross-Origin-Embedder-Policy Header Missing or Invalid": "Cross-Origin-Embedder-Policy (COEP) Header Missing",
        "Cross-Origin-Opener-Policy Header Missing or Invalid": "Cross-Origin-Opener-Policy (COOP) Header Missing",
        "Cross-Origin-Resource-Policy Header Missing or Invalid": "Cross-Origin-Resource-Policy (CORP) Header Missing",
        'Server Leaks Version Information via "Server" HTTP Response Header Field': "Server Leaks Version Information",
        "Storable and Cacheable Content": "Storable but Non-Cacheable Content",
    }
    return replacements.get(normalized, normalized)


@dataclass
class Report:
    version: str
    fail_new: int
    warn_new: int
    passed: int
    alerts: list[Alert]

    @property
    def notable_warnings(self) -> str:
        names = {alert.name for alert in self.alerts}
        extras = [
            f"{alert.name} [{alert.rule_id}]"
            for alert in self.alerts
            if alert.name not in HEADER_WARNING_KEYS
            and alert.name != "Server Leaks Version Information"
            and alert.severity.lower() != "informational"
        ]
        notable: list[str] = []
        if names & HEADER_WARNING_KEYS:
            notable.append("Missing headers")
        if "Server Leaks Version Information" in names:
            notable.append("Server version leak")
        notable.extend(sorted(extras))
        return " + ".join(notable) if notable else "None"

    @property
    def strategy_code(self) -> str:
        match = VERSION_RE.search(self.version)
        if not match:
            return "UNK"
        return match.group(2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate markdown summary from ZAP baseline markdown reports."
    )
    parser.add_argument(
        "inputs",
        nargs="+",
        help="Report files or directories containing downloaded ZAP artifact files.",
    )
    parser.add_argument(
        "--run-url",
        help="Workflow run URL to include in the generated markdown.",
    )
    parser.add_argument(
        "--exclude-version",
        action="append",
        default=[],
        help="Version name to exclude from strategy and warning aggregation. Repeatable.",
    )
    parser.add_argument(
        "--output",
        help="Write markdown to a file instead of stdout.",
    )
    return parser.parse_args()


def discover_markdown_reports(inputs: Iterable[str]) -> list[Path]:
    candidates: list[Path] = []
    for raw_input in inputs:
        path = Path(raw_input)
        if not path.exists():
            raise FileNotFoundError(f"Input path does not exist: {path}")
        if path.is_file() and path.suffix.lower() == ".md":
            candidates.append(path)
            continue
        if path.is_dir():
            candidates.extend(
                sorted(
                    child
                    for child in path.rglob("*.md")
                    if child.name.lower() not in {"readme.md"}
                )
            )
    if not candidates:
        raise FileNotFoundError("No markdown report files were found in the provided inputs.")
    return candidates


def infer_version(path: Path) -> str:
    for candidate in [path.name, *path.parts[::-1]]:
        match = VERSION_RE.search(candidate)
        if match:
            return match.group(0)
    raise ValueError(f"Could not infer version name from path: {path}")


def parse_summary_counts(text: str, source: Path) -> dict[str, int]:
    counts: dict[str, int] = {}
    for key, pattern in SUMMARY_PATTERNS.items():
        match = pattern.search(text)
        if match:
            counts[key] = int(match.group(1))
    if len(counts) == 3:
        return counts

    risk_counts = {"High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    for line in text.splitlines():
        match = SUMMARY_TABLE_ROW_RE.match(line.strip())
        if match:
            risk_counts[match.group(1).title()] = int(match.group(2))

    if any(risk_counts.values()):
        fail_new = risk_counts["High"]
        warn_new = risk_counts["Medium"] + risk_counts["Low"]
        passed = DEFAULT_RULE_TOTAL - fail_new - warn_new
        if passed < 0:
            raise ValueError(
                f"Calculated PASS became negative for report {source}. Check DEFAULT_RULE_TOTAL."
            )
        return {"FAIL-NEW": fail_new, "WARN-NEW": warn_new, "PASS": passed}

    missing_key = next(key for key in SUMMARY_PATTERNS if key not in counts)
    raise ValueError(f"Could not find {missing_key} in report: {source}")


def parse_alerts(lines: list[str]) -> list[Alert]:
    table_alerts: list[Alert] = []
    rule_ids_by_name: dict[str, str] = {}

    for line in lines:
        row_match = ALERT_TABLE_ROW_RE.match(line.strip())
        if row_match:
            name = normalize_alert_name(row_match.group(1))
            severity = row_match.group(2).strip()
            table_alerts.append(Alert(name=name, rule_id="unknown", severity=severity))

        header_link_match = ALERT_HEADER_LINK_RE.match(line.strip())
        if header_link_match:
            rule_ids_by_name[normalize_alert_name(header_link_match.group(1))] = header_link_match.group(2)

    alerts: list[Alert] = []
    current_name: str | None = None
    current_rule_id: str | None = None
    current_risk: str | None = None

    def flush_current() -> None:
        nonlocal current_name, current_rule_id, current_risk
        if current_name and current_rule_id and current_risk:
            alerts.append(
                Alert(name=current_name, rule_id=current_rule_id, severity=current_risk)
            )
        current_name = None
        current_rule_id = None
        current_risk = None

    for line in lines:
        header_link_match = ALERT_HEADER_LINK_RE.match(line.strip())
        if header_link_match:
            flush_current()
            current_name = normalize_alert_name(header_link_match.group(1))
            current_rule_id = header_link_match.group(2).strip()
            continue

        header_match = ALERT_HEADER_RE.match(line.strip())
        if header_match:
            flush_current()
            current_name = normalize_alert_name(header_match.group(1))
            current_rule_id = header_match.group(2).strip()
            continue

        if current_name:
            risk_match = RISK_ROW_RE.match(line.strip())
            if risk_match:
                current_risk = risk_match.group(1).strip()

    flush_current()

    if alerts:
        return alerts

    return [
        Alert(
            name=alert.name,
            rule_id=rule_ids_by_name.get(alert.name, alert.rule_id),
            severity=alert.severity,
        )
        for alert in table_alerts
    ]


def parse_report(path: Path) -> Report:
    text = path.read_text(encoding="utf-8")
    counts = parse_summary_counts(text, path)
    alerts = parse_alerts(text.splitlines())
    return Report(
        version=infer_version(path),
        fail_new=counts["FAIL-NEW"],
        warn_new=counts["WARN-NEW"],
        passed=counts["PASS"],
        alerts=alerts,
    )


def strategy_label(strategy_code: str) -> str:
    return {
        "BP": "**BP** (Basic Prompting)",
        "CE": "**CE** (Context Engineering)",
        "SD": "**SD** (Spec-Driven Dev)",
    }.get(strategy_code, f"**{strategy_code}**")


def format_warning_affected(affected_versions: list[str], total_scanned: int) -> str:
    names = ", ".join(affected_versions)
    return f"{len(affected_versions)}/{total_scanned}" + (f" ({names})" if names else "")


def generate_markdown(reports: list[Report], run_url: str | None) -> str:
    included_reports = sorted(reports, key=lambda item: item.version)
    total_scanned = len(included_reports)

    warning_to_versions: dict[tuple[str, str, str], list[str]] = defaultdict(list)
    for report in included_reports:
        seen_warning_keys: set[tuple[str, str, str]] = set()
        for alert in report.alerts:
            key = (alert.name, alert.rule_id, alert.severity)
            if key in seen_warning_keys:
                continue
            warning_to_versions[key].append(report.version)
            seen_warning_keys.add(key)

    strategy_reports: dict[str, list[Report]] = defaultdict(list)
    for report in included_reports:
        strategy_reports[report.strategy_code].append(report)

    lines: list[str] = []
    lines.append("## 4. DAST Security Scan (ZAP)")
    lines.append("")
    if run_url:
        lines.append(f"> Workflow run: [{run_url.split('/')[-1]}]({run_url})")
    lines.append(f"> Result: :white_check_mark: **{total_scanned}/{total_scanned} JOBS SCANNED**")
    lines.append("")
    lines.append("| Version | FAIL-NEW | WARN-NEW | PASS | Notable Warnings |")
    lines.append("| ------- | -------- | -------- | ---- | ---------------- |")
    for report in included_reports:
        lines.append(
            f"| {report.version} | {report.fail_new} | {report.warn_new} | {report.passed} | {report.notable_warnings} |"
        )

    lines.append("")
    lines.append("### Common ZAP Warnings (across all versions)")
    lines.append("")
    lines.append("| Warning | Rule ID | Severity | Affected |")
    lines.append("| ------- | ------- | -------- | -------- |")
    for (name, rule_id, severity), versions in sorted(
        warning_to_versions.items(),
        key=lambda item: (-len(item[1]), item[0][0].lower(), item[0][1]),
    ):
        lines.append(
            f"| {name} | {rule_id} | {severity} | {format_warning_affected(sorted(versions), total_scanned)} |"
        )

    lines.append("")
    lines.append("### DAST Summary by Strategy")
    lines.append("")
    lines.append("| Strategy | Avg Warnings | Avg Pass | Server Leak | Scan Status |")
    lines.append("| -------- | ------------ | -------- | ----------- | ----------- |")
    for strategy_code in ["BP", "CE", "SD"]:
        bucket = strategy_reports.get(strategy_code, [])
        if not bucket:
            continue
        avg_warnings = sum(item.warn_new for item in bucket) / len(bucket)
        avg_pass = sum(item.passed for item in bucket) / len(bucket)
        server_leaks = [item.version for item in bucket if any(
            alert.name == "Server Leaks Version Information" for alert in item.alerts
        )]
        server_leak_text = format_warning_affected(server_leaks, len(bucket))
        lines.append(
            f"| {strategy_label(strategy_code)} | {avg_warnings:.1f} | {avg_pass:.1f} | {server_leak_text} | {len(bucket)}/{len(bucket)} scanned |"
        )

    lines.append("")
    return "\n".join(lines)


def main() -> int:
    try:
        args = parse_args()
        reports = [parse_report(path) for path in discover_markdown_reports(args.inputs)]
        excluded = set(args.exclude_version)
        filtered_reports = [report for report in reports if report.version not in excluded]
        markdown = generate_markdown(filtered_reports, args.run_url)

        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(markdown, encoding="utf-8")
        else:
            sys.stdout.write(markdown)
        return 0
    except (FileNotFoundError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        print(
            "hint: pass a real report file or a directory that contains downloaded ZAP markdown artifacts, for example './zap-artifacts/'",
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
