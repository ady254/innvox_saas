from dataclasses import dataclass


@dataclass(frozen=True)
class TenantState:
    """Resolved tenant for the current request (domain-based)."""

    id: int
    name: str
    domain: str
    primary_color: str
    logo: str | None
