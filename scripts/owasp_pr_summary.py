import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

from owasp_render import render_owasp_summary


def _required_env(name):
    value = os.environ.get(name)
    if not value:
        print(f"::error::{name} e obrigatorio", file=sys.stderr)
        sys.exit(1)
    return value


def _fetch_json(url, token):
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read())
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as error:
        print(f"::warning::Falha ao consultar {url}: {error}", file=sys.stderr)
        return None


def main():
    sonar_token = _required_env("SONAR_TOKEN")
    project_key = _required_env("SONAR_PROJECT_KEY")
    pr_number = _required_env("PR_NUMBER")
    host_url = os.environ.get("SONAR_HOST_URL", "https://sonarcloud.io")

    issues_url = (
        f"{host_url}/api/issues/search?componentKeys={project_key}"
        f"&pullRequest={pr_number}&resolved=false&types=VULNERABILITY"
        f"&facets=owaspTop10-2021&ps=100"
    )
    hotspots_url = (
        f"{host_url}/api/hotspots/search?projectKey={project_key}"
        f"&pullRequest={pr_number}&status=TO_REVIEW&ps=100"
    )

    issues_json = _fetch_json(issues_url, sonar_token)
    hotspots_json = _fetch_json(hotspots_url, sonar_token)

    if issues_json is None or hotspots_json is None:
        print("::warning::Pulando resumo OWASP no PR por falha na API do SonarCloud.")
        return

    summary = render_owasp_summary(issues_json, hotspots_json)

    result = subprocess.run(
        ["gh", "pr", "comment", pr_number, "--body", summary],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"::warning::Nao foi possivel comentar no PR: {result.stderr}")


if __name__ == "__main__":
    main()
