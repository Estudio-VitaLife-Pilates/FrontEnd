import unittest

from owasp_render import render_owasp_summary


class RenderOwaspSummaryTest(unittest.TestCase):
    def test_no_findings_renders_fallback_message(self):
        issues = {"total": 0, "facets": []}
        hotspots = {"paging": {"total": 0}, "hotspots": []}

        result = render_owasp_summary(issues, hotspots)

        self.assertIn("Nenhum achado novo de segurança (OWASP) neste PR.", result)

    def test_vulnerabilities_grouped_by_owasp_category(self):
        issues = {
            "total": 2,
            "facets": [
                {
                    "property": "owaspTop10-2021",
                    "values": [{"val": "a3", "count": 1}, {"val": "a7", "count": 1}],
                }
            ],
            "issues": [
                {
                    "severity": "CRITICAL",
                    "message": "Possivel XSS em innerHTML",
                    "component": "src/components/Foo.jsx",
                    "line": 21,
                },
                {
                    "severity": "MAJOR",
                    "message": "Token JWT armazenado em localStorage",
                    "component": "src/services/auth.js",
                    "line": 8,
                },
            ],
        }
        hotspots = {"paging": {"total": 0}, "hotspots": []}

        result = render_owasp_summary(issues, hotspots)

        self.assertIn("A03 - Injection", result)
        self.assertIn("A07 - Identification and Authentication Failures", result)
        self.assertIn("Possivel XSS em innerHTML", result)

    def test_hotspots_listed_in_their_own_section(self):
        issues = {"total": 0, "facets": []}
        hotspots = {
            "paging": {"total": 1},
            "hotspots": [
                {
                    "vulnerabilityProbability": "MEDIUM",
                    "securityCategory": "others",
                    "message": "Revisar URL externa hardcoded",
                    "component": "src/services/api.js",
                    "line": 5,
                }
            ],
        }

        result = render_owasp_summary(issues, hotspots)

        self.assertIn("Security Hotspots a revisar", result)
        self.assertIn("Revisar URL externa hardcoded", result)


if __name__ == "__main__":
    unittest.main()
