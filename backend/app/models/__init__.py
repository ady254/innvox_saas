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
