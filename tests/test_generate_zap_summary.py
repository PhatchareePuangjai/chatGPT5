from pathlib import Path
import subprocess
import sys
import tempfile
import textwrap
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "generate_zap_summary.py"


def write_report(base: Path, version: str, fail_new: int, warn_new: int, passed: int, alerts: list[tuple[str, str, str]]) -> None:
    report_dir = base / f"zap-report-{version}"
    report_dir.mkdir(parents=True, exist_ok=True)
    sections = "\n".join(
        textwrap.dedent(
            f"""
            ### {name} [{rule_id}]
            | Risk | {severity} |
            """
        ).strip()
        for name, rule_id, severity in alerts
    )
    content = textwrap.dedent(
        f"""
        # ZAP Scanning Report

        FAIL-NEW: {fail_new}
        WARN-NEW: {warn_new}
        PASS: {passed}

        {sections}
        """
    ).strip() + "\n"
    (report_dir / "report_md.md").write_text(content, encoding="utf-8")


class GenerateZapSummaryTest(unittest.TestCase):
    def test_generates_expected_summary_sections(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            base = Path(temp_dir)
            write_report(
                base,
                "IMBP01",
                0,
                7,
                60,
                [
                    ("Content Security Policy (CSP) Header Not Set", "10038", "Medium"),
                    ("X-Content-Type-Options Header Missing", "10021", "Low"),
                ],
            )
            write_report(
                base,
                "SCCE01",
                0,
                8,
                59,
                [
                    ("Content Security Policy (CSP) Header Not Set", "10038", "Medium"),
                    ("Server Leaks Version Information", "10036", "Low"),
                ],
            )
            write_report(
                base,
                "SCSD01_v2",
                0,
                99,
                1,
                [
                    ("Server Leaks Version Information", "10036", "Low"),
                ],
            )
            write_report(
                base,
                "PDSD01",
                0,
                9,
                58,
                [
                    ("Content Security Policy (CSP) Header Not Set", "10038", "Medium"),
                    ("Server Leaks Version Information", "10036", "Low"),
                    ("In Page Banner Information Leak", "10009", "Low"),
                ],
            )

            completed = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    str(base),
                    "--exclude-version",
                    "SCSD01_v2",
                    "--run-url",
                    "https://github.com/example/repo/actions/runs/24028162574",
                ],
                check=True,
                capture_output=True,
                text=True,
            )

            output = completed.stdout
            self.assertIn("| IMBP01 | 0 | 7 | 60 | Missing headers |", output)
            self.assertIn("| SCCE01 | 0 | 8 | 59 | Missing headers + Server version leak |", output)
            self.assertIn(
                "| PDSD01 | 0 | 9 | 58 | Missing headers + Server version leak + In Page Banner Information Leak [10009] |",
                output,
            )
            self.assertIn("| Content Security Policy (CSP) Header Not Set | 10038 | Medium | 3/3 (IMBP01, PDSD01, SCCE01) |", output)
            self.assertIn("| **BP** (Basic Prompting) | 7.0 | 60.0 | 0/1 | 1/1 scanned |", output)
            self.assertIn("| **CE** (Context Engineering) | 8.0 | 59.0 | 1/1 (SCCE01) | 1/1 scanned |", output)
            self.assertIn("| **SD** (Spec-Driven Dev) | 9.0 | 58.0 | 1/1 (PDSD01) | 1/1 scanned |", output)
            self.assertNotIn("SCSD01_v2", output)


if __name__ == "__main__":
    unittest.main()
