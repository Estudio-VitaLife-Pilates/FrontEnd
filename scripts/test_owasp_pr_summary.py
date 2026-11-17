import os
import unittest
from unittest import mock

import owasp_pr_summary


class RequiredEnvTest(unittest.TestCase):
    def test_missing_env_var_exits_with_error(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(SystemExit) as context:
                owasp_pr_summary._required_env("SONAR_TOKEN")
            self.assertEqual(context.exception.code, 1)

    def test_present_env_var_is_returned(self):
        with mock.patch.dict(os.environ, {"SONAR_TOKEN": "abc123"}, clear=True):
            self.assertEqual(owasp_pr_summary._required_env("SONAR_TOKEN"), "abc123")


class FetchJsonTest(unittest.TestCase):
    def test_returns_parsed_json_on_success(self):
        fake_response = mock.MagicMock()
        fake_response.read.return_value = b'{"total": 0}'
        fake_response.__enter__.return_value = fake_response

        with mock.patch("owasp_pr_summary.urllib.request.urlopen", return_value=fake_response):
            result = owasp_pr_summary._fetch_json("https://example.org", "token")

        self.assertEqual(result, {"total": 0})

    def test_returns_none_on_request_failure(self):
        with mock.patch(
            "owasp_pr_summary.urllib.request.urlopen",
            side_effect=owasp_pr_summary.urllib.error.URLError("boom"),
        ):
            result = owasp_pr_summary._fetch_json("https://example.org", "token")

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
