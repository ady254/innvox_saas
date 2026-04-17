from dataclasses import dataclass
from datetime import datetime
from typing import List

@dataclass(frozen=True)
class TenantState:
    """Resolved tenant for the current request (domain-based)."""

    id: int
    name: str
    domain: str
    primary_color: str
    logo: str | None
    plan: str
    expiry_date: datetime | None
    allowed_languages: List[str]
