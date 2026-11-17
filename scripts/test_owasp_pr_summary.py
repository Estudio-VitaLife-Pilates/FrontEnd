import os
import unittest
from unittest import mock

import owasp_pr_summary


class RequiredEnvTest(unittest.TestCase):
    def test_missing_env_var_exits_with_error(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(SystemExit) as context:
                owasp_pr_summary._required_env("SONAR_PROJECT_KEY")
            self.assertEqual(context.exception.code, 1)

    def test_present_env_var_is_returned(self):
        with mock.patch.dict(os.environ, {"SONAR_PROJECT_KEY": "abc123"}, clear=True):
            self.assertEqual(owasp_pr_summary._required_env("SONAR_PROJECT_KEY"), "abc123")


class BuildUrlTest(unittest.TestCase):
    def test_encodes_query_parameters(self):
        url = owasp_pr_summary._build_url(
            "https://sonarcloud.io", "/api/issues/search", {"componentKeys": "a&b", "ps": 100}
        )

        self.assertEqual(url, "https://sonarcloud.io/api/issues/search?componentKeys=a%26b&ps=100")


class FetchJsonTest(unittest.TestCase):
    def test_works_without_a_token(self):
        fake_response = mock.MagicMock()
        fake_response.read.return_value = b'{"total": 0}'
        fake_response.__enter__.return_value = fake_response
        captured_request = {}

        def fake_urlopen(request, timeout):
            captured_request["headers"] = request.headers
            return fake_response

        with mock.patch("owasp_pr_summary.urllib.request.urlopen", side_effect=fake_urlopen):
            result = owasp_pr_summary._fetch_json("https://example.org")

        self.assertEqual(result, {"total": 0})
        self.assertNotIn("Authorization", captured_request["headers"])

    def test_adds_authorization_header_when_token_given(self):
        fake_response = mock.MagicMock()
        fake_response.read.return_value = b'{"total": 0}'
        fake_response.__enter__.return_value = fake_response
        captured_request = {}

        def fake_urlopen(request, timeout):
            captured_request["headers"] = request.headers
            return fake_response

        with mock.patch("owasp_pr_summary.urllib.request.urlopen", side_effect=fake_urlopen):
            owasp_pr_summary._fetch_json("https://example.org", "my-token")

        self.assertEqual(captured_request["headers"]["Authorization"], "Bearer my-token")

    def test_returns_none_on_request_failure(self):
        with mock.patch(
            "owasp_pr_summary.urllib.request.urlopen",
            side_effect=owasp_pr_summary.urllib.error.URLError("boom"),
        ):
            result = owasp_pr_summary._fetch_json("https://example.org")

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
