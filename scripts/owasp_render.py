OWASP_NAMES = {
    "a1": "A01 - Broken Access Control",
    "a2": "A02 - Cryptographic Failures",
    "a3": "A03 - Injection",
    "a4": "A04 - Insecure Design",
    "a5": "A05 - Security Misconfiguration",
    "a6": "A06 - Vulnerable and Outdated Components",
    "a7": "A07 - Identification and Authentication Failures",
    "a8": "A08 - Software and Data Integrity Failures",
    "a9": "A09 - Security Logging and Monitoring Failures",
    "a10": "A10 - Server-Side Request Forgery",
}


def _location(entry):
    component = entry.get("component", "")
    line = entry.get("line")
    return f"`{component}`:{line}" if line else f"`{component}`"


def render_owasp_summary(issues_json, hotspots_json):
    issues_total = issues_json.get("total", 0)
    hotspots_total = hotspots_json.get("paging", {}).get("total", 0)

    lines = ["## Resumo de seguranca (OWASP) deste PR", ""]

    if issues_total == 0 and hotspots_total == 0:
        lines.append("Nenhum achado novo de segurança (OWASP) neste PR.")
        return "\n".join(lines)

    facet_values = []
    for facet in issues_json.get("facets", []):
        if facet.get("property") == "owaspTop10-2021":
            facet_values = facet.get("values", [])
            break

    if facet_values:
        lines.append("### Vulnerabilidades novas por categoria")
        lines.append("")
        lines.append("| Categoria OWASP | Qtd |")
        lines.append("|---|---|")
        for value in facet_values:
            code = value.get("val", "")
            count = value.get("count", 0)
            lines.append(f"| {OWASP_NAMES.get(code, code)} | {count} |")
        lines.append("")

    issues = issues_json.get("issues", [])
    if issues:
        lines.append("### Detalhe das vulnerabilidades novas")
        lines.append("")
        for issue in issues:
            severity = issue.get("severity", "?")
            message = issue.get("message", "")
            lines.append(f"- **{severity}** {message} ({_location(issue)})")
        lines.append("")

    hotspots = hotspots_json.get("hotspots", [])
    if hotspots:
        lines.append("### Security Hotspots a revisar")
        lines.append("")
        for hotspot in hotspots:
            probability = hotspot.get("vulnerabilityProbability", "?")
            category = hotspot.get("securityCategory", "others")
            message = hotspot.get("message", "")
            lines.append(f"- **{probability}** [{category}] {message} ({_location(hotspot)})")
        lines.append("")

    return "\n".join(lines)
