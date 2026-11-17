import json
import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlencode

from owasp_render import render_owasp_summary


def _required_env(name):
    value = os.environ.get(name)
    if not value:
        print(f"::error::{name} e obrigatorio", file=sys.stderr)
        sys.exit(1)
    return value


def _build_url(host_url, path, params):
    return f"{host_url}{path}?{urlencode(params)}"


def _fetch_json(url, token=None):
    request = urllib.request.Request(url)
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read())
    except (urllib.error.URLError, TimeoutError) as error:
        print(f"::warning::Falha ao consultar {url}: {error}", file=sys.stderr)
        return None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    project_key = _required_env("SONAR_PROJECT_KEY")
    pr_number = _required_env("PR_NUMBER")
    host_url = os.environ.get("SONAR_HOST_URL", "https://sonarcloud.io")
    sonar_token = os.environ.get("SONAR_TOKEN")  # opcional: o projeto e publico

    issues_url = _build_url(
        host_url,
        "/api/issues/search",
        {
            "componentKeys": project_key,
            "pullRequest": pr_number,
            "resolved": "false",
            "types": "VULNERABILITY",
            "facets": "owaspTop10-2021",
            "ps": 100,
        },
    )
    hotspots_url = _build_url(
        host_url,
        "/api/hotspots/search",
        {
            "projectKey": project_key,
            "pullRequest": pr_number,
            "status": "TO_REVIEW",
            "ps": 100,
        },
    )

    issues_json = _fetch_json(issues_url, sonar_token)
    hotspots_json = _fetch_json(hotspots_url, sonar_token)

    if issues_json is None or hotspots_json is None:
        print("::warning::Pulando resumo OWASP no PR por falha na API do SonarCloud.", file=sys.stderr)
        return

    print(render_owasp_summary(issues_json, hotspots_json))


if __name__ == "__main__":
    main()
