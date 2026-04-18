"""
SQLAlchemy ORM models.

Importing this package ensures all model classes are registered on `Base.metadata`.
"""

from .client import Client  # noqa: F401
from .user import User  # noqa: F401
from .course import Course  # noqa: F401
from .enrollment import Enrollment  # noqa: F401
from .class_model import ClassSession  # noqa: F401
from .result import Result  # noqa: F401
from .page_content import PageContent  # noqa: F401
from .lead import Lead  # noqa: F401
from .testimonial import Testimonial  # noqa: F401
from .announcement import Announcement  # noqa: F401
from .contact_settings import ContactSettings  # noqa: F401
from .platform_announcement import PlatformAnnouncement  # noqa: F401
from .feature_toggle import Feature, PlanFeature, ClientFeature  # noqa: F401
from .certificate import Certificate  # noqa: F401
